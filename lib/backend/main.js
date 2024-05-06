"use strict";
const Plugin = {};
const path = require("path");
const fs = require("fs");
const winston = require.main.require("winston");
const meta = require.main.require("./src/meta");
const db = require.main.require("./src/database");
const cache = require.main.require("./src/cache");
const topics = require.main.require("./src/topics");
const {setupPageRoute, setupApiRoute, setupAdminPageRoute} = require.main.require("./src/routes/helpers");
const { handleAddPlaceRequest , reImportPlaces } = require("./placeFormHandler");
const topicModifier = require("./topicModifier");

let settings;

Plugin.init = async ({ router, middleware, controllers, helpers } ) => {
  settings = await getSettings({ forceRefresh: true });
  const customRoute = settings?.mapPageRouter || "/map";
 
  setupAdminPageRoute(
    router,
    "/admin/plugins/unimap",
    [],
    (req, res) => {
      res.render("admin/plugins/unimap", {
        title: "UNIMAP SETTINGS",
        settings,
      }); // TODO
    }
  );

  
 setupPageRoute(
  router,
  customRoute,
  [
    // (req, res, next) => {
    //   setImmediate(next);
    // },
  ],
   (req, res) => {

    if (settings.templateName && settings.mapTitle && settings.mapTriggerClass) {
      res.render(settings.templateName, {
        title: settings.mapTitle,
        browserTitle: settings.mapTitle,
        uid: req.uid,
      });
    } else {
      res.render("tos", {
        termsOfUse:
          "<h2>First You need setup plugin!</h2> Deactivate & Activate Again, then restart forum",
      });
    }
  }
);

  // setupPageRoute(
  //   router,
  //   customRoute + "/:username",
  //   [],
  //   (req, res) => {
  //     const mapUsername = req.params?.username || 0;
  //     const needOpenPlaceTid = getTid(mapUsername);
  //     const unimap = { needOpenPlaceTid, mapUsername };
  //     const title = settings.mapTitle|| 'Unsetted Map Plugin'
  //     res.render(settings.templateName, {
  //       title: mapUsername + " | " + title,
  //       browserTitle: mapUsername + " " + title,
  //       uid: req.uid,
  //       unimap,
  //     });
  //   }
  // );


};


Plugin.onEachRender = async (data) => {
  try {
    settings = await getSettings({ forceRefresh: false });

    if (settings && settings.templateName && settings.mapTriggerClass) {
      const {
        templateData,
        templateData: {
          template: { name },
        },
      } = data;
      templateData.bodyClass +=
        name === settings.templateName ? ` ${settings.mapTriggerClass}` : "";

      data.templateData.UniMapSettings = settings;

      if (templateData.mapFields) {
      }
    }
  } catch (error) {
    // TODO: error reporting
  }

  return data;
};


Plugin.addPlaceFieldsToTopic = async (data) => {
  const settings = await getSettings({ forceRefresh: false });
  let modifiedData = topicModifier(data, settings, winston);
  return modifiedData;
};

Plugin.defineWidgetAreas = async (areas) => {
  areas = areas.concat([
    {
      name: "UNIMAP Pull-Up Panel",
      template: "global",
      location: "unimap-pull-up-panel",
    },
  ]);
  return areas;
};

Plugin.addAdminNavigation = (header) => {
  header.plugins.push({
    route: "/plugins/unimap",
    icon: "fa-compass-drafting",
    name: "UniMap",
  });
  return header;
};


Plugin.activate = async (data) => {
  await setDefaultSettings({forced:false})
};



Plugin.addRoutes = async ({ router, middleware, helpers }) => {
  if (!helpers || !helpers.formatApiResponse) {
    return;
  }

  const onlyAdmin = [
		middleware.ensureLoggedIn,			// use this if you want only registered users to call this route
		middleware.admin.checkPrivileges,	// use this to restrict the route to administrators
	];


setupApiRoute(
  router,
  "get",
  "/map/getplace/:tid",
  [],
  async (req, res) => {

    try {
      const tid = Number(req.params.tid);
      const place = await topics.getTopicField(tid, "mapFields");
      helpers.formatApiResponse(200, res, {
        status: "success",
        placeOnMap: place,
        tid,
      });
    } catch (error) {
      winston.warn(`error /map/getplace/:tid ${error.message}`);
      helpers.formatApiResponse(500, res, {
        error: "Something went wrong with getplace",
      });
    }
  }
);

setupApiRoute(
  router,
  "get",
  "/map/getplaces",
  [],
  async (req, res) => {
   
    try {
      const places = await db.getObject(`unimap:places`);
      const placesArray = places ? Object.values(places) : [];
      helpers.formatApiResponse(200, res, { status: "success", placesArray });
    } catch (error) {
      helpers.formatApiResponse(200, res, { status: "success", placesArray:[], error: "Something went wrong"});
     
    }
  }
);


 setupApiRoute(
  router,
  "post",
  "/map/addplace",
  [],
  async (req, res) => {
      await handleAddPlaceRequest(req, res, helpers);
 }
);

setupApiRoute(router, "post",  "/unimap/reImportPlaces",  onlyAdmin,  async (req, res) => {
      await reImportPlaces(req, res, helpers);
  }
);

setupApiRoute(  router,"post",  "/unimap/flushsettings", onlyAdmin, async (req, res) => {
  let recovered = null
  let placesDeletion = null
  try {
    const { confirmation } = req.body;
    const confirmedErasing = confirmation === "I confirm the deletion of settings";
    const confirmedTotalDeletion = confirmation === "I confirm the deletion of ALL settings AND ALL PLACES";

    const recreationRegex = /^I confirm the resetting and recreation of settings from (.+\.json)$/;
    const match = confirmation.match(recreationRegex);
    let confirmedResetToDefaults = false;
    let fileName = '';

    if (match) {
        confirmedResetToDefaults = true;
        fileName = match[1]; 
    }

    const sets = await meta.settings.get("unimap");

    if(!confirmedErasing && !confirmedResetToDefaults && !confirmedTotalDeletion){
      helpers.formatApiResponse(200, res, { error:'Settings not deleted: '+confirmation});
      return
    }


    for (let key in sets) {
      if (sets.hasOwnProperty(key)) {
        if (Array.isArray(sets[key])) {
          // if the setting is an array, we need to delete the sorted set
          const numItems = await db.sortedSetCard(
            `settings:unimap:sorted-list:${key}`
          );
          const deleteKeys = [`settings:unimap:sorted-list:${key}`];
          for (let x = 0; x < numItems; x++) {
            deleteKeys.push(`settings:unimap:sorted-list:${key}:${x}`);
          }
          await db.deleteAll(deleteKeys);
          await db.setRemove(`settings:unimap:sorted-lists`, key);
        } else {
          // if the setting is not an array, we can just delete the field
          await db.deleteObjectField("settings:unimap", key);
        }
      }
    }
    await cache.del("settings:unimap");
    const updated = await meta.settings.get("unimap");


    if(confirmedResetToDefaults){
      recovered = await setDefaultSettings({forced:true,fileName})
    }

    if(confirmedTotalDeletion){
      try {
          placesDeletion = await db.delete("unimap:places");
              
            } catch (error) {
              winston.warn(`delete_all_places: ${error.message}`);
             
            }
    }

    console.warn('Flushsettings: ',{ sets, updated, recovered, placesDeletion})
    helpers.formatApiResponse(200, res, { status:"ok",sets, updated, recovered, placesDeletion});
  } catch (error) {
    winston.warn(`ERR. flush_settings: ${error.message}`);
    helpers.formatApiResponse(200, res, { error: "flush_settings" });
  }
});

setupApiRoute(router,"get",  "/unimap/setdefaults", onlyAdmin, async (req, res) => {
  let result = await setDefaultSettings({forced:false}) // Will Work only if settings are empty
  helpers.formatApiResponse(200, res, { message: "setdefaults, please rebuild and restart NodeBB", result }); 
})

};

async function setDefaultSettings({forced,fileName}) {
  let file = fileName || 'defaultSettings.json'
  try {
    let settings = await getSettings({ forceRefresh: true });
    if (settings?.debuginfo?.activation && !forced) {
      // Skip if settings exist and changing not forced
      return settings;
    }

    const defaultSettingsPath = path.resolve(  __dirname,  '..',  '..', 'settings', file );
    let defaultSettings = JSON.parse(fs.readFileSync(defaultSettingsPath, "utf8"));
    let newSettings = { ...defaultSettings, debuginfo: { activation: Math.floor(Date.now() / 1000) } };
    await meta.settings.set("unimap", newSettings);
    return newSettings;

  } catch (error) {
    return { errorLog: 'Error: ' + error.toString() };
  }
}


async function getSettings({ forceRefresh = false } = {}) {
  if (settings?.templateName && !forceRefresh) {
    return settings;
  } else {
    try {
      const freshSettings = await meta.settings.get("unimap");

      if(Object.keys(freshSettings).length === 0){
         return {};
      } else {
        return freshSettings;
      }
     } catch (error) {
      return {};
    }
  }
}

function getTid(str) {
  const regex = /^\d+$/;

  if (regex.test(str)) {
    const num = parseInt(str, 10);
    if (num > 0) {
      return num;
    }
  }

  return false;
}


module.exports = Plugin;