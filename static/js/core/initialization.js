"use strict";

define("core/initialization", [
  "utils/extensions",
  "core/interactions",
  "core/configurations",
  "core/fragmentManager",
  "utils/handlers",
  "utils/mapFeatures",
  "core/swipersCreator",
  "population/categoriesCreator",
  "events/mapReady",
  "ui/swipeDetectors",
  "forms/regionCreator",
  "markers/markersFetcher",
  "markers/markersPopulator",
  "ui/elementPositions",
  "utils/methods",
  "panels/categoryButtonsSwiper",
  "panels/cardSwiper",
  "panels/bottomSheets",
  'panels/contextButton',
  "population/tabsPopulator",
  "markers/markersFilter",
  "markers/advMarkers",
  "markers/markersConfigurator",
  "events/basicListeners",
  "events/hooks",
  "utils/expandMap",
  "forms/submitPlace",
  "forms/editPlace",
  "topics/topicPost",
  "events/registerableListeners",
], function (
  extensions,
  interactions,
  configurations,
  fragmentManager,
  handlers,
  mapFeatures,
  mapReady,
  swipersCreator,
  swipeDetectors,
  categoriesCreator,
  regionCreator,
  markersFetcher,
  markersPopulator,
  elementPositions,
  methods,
  categoryButtonsSwiper,
  cardSwiper,
  bottomSheets,
  contextButton,
  tabsPopulator,
  markersFilter,
  advMarkers,
  markersConfigurator,
  basicListeners,
  hooks,
  expandMap,
  submitPlace,
  editPlace,
  topicPost,
  registerableListeners,
  // Built-in AMD modules:
  module 
) {


return async (UniMap) => {
     UniMap.firstInitTime = Date.now();
    const hooks = await app.require("hooks");
   
    const reload = async (UniMap) => {
      let allowLoadOldfromCache = (UniMap.map?._leaflet_id && UniMap?.allPlaces && Object.keys(UniMap.allPlaces).length > 0)  ? true  : false;
      UniMap.latestLocation = UniMap.api.getLatestLocation();
      
      if (!UniMap.eventListenersInstance) { 
        UniMap.eventListenersInstance = new registerableListeners(UniMap);
      } 

      if(!UniMap.fragment){
        UniMap.fragment = new fragmentManager()
      }
      
    
      UniMap.api.configureMapElements();
      UniMap.api.initializeSwipers();

      UniMap.api.mapInit();
      UniMap.api.addMapLayers();
      UniMap.api.addMapControls();

      UniMap.api.createCategories();
      
      try {
        if (UniMap && UniMap.categoryClusters && UniMap.categoryClusters.allMarkersCluster) {
          const layers = UniMap.categoryClusters.allMarkersCluster.getLayers();
          if (layers && layers.length > 0 ) {
            UniMap.console.log('Already Populated');
          } else {
            const markers = await UniMap.api.fetchMarkers(allowLoadOldfromCache);
            if (markers) {
              
              UniMap.api.populatePlaces(markers);
              UniMap.api.populateTabs();
    
            } else {
              UniMap.console.log('No markers returned from API');
            }
          }
        } else {
          UniMap.console.log('UniMap or its properties are not defined');
        }
      } catch (error) {
        UniMap.console.log('An error occurred:', error);
      }
      
    

      
      UniMap.api.createCategoryButtonsSwiper($("#location-category-filter").val() ?? "");
      UniMap.api.hideElements(false);
      UniMap.api.cleanMarkers(true);
      UniMap.api.cardsOpened(false);
      UniMap.api.setCategory("");
      UniMap.api.filterMarkers(false);
      UniMap.api.registerHooks()
      UniMap.api.reserveClusterForAdvMarkers()
      UniMap.api.mapReLoad();
      UniMap.api.mainFrameShow();
      UniMap.api.saveWidgetsToFragment();
      UniMap.form.createGeoEntities();
      UniMap.form.submitPlace()
      

      UniMap.eventListenersInstance.register();
      


      

      

      if(app.user.isAdmin){
        // Make accessible globally for debugging purposes
          window.UniMap = UniMap;
      }

      return UniMap

    }

    await reload(UniMap)

    hooks.on("action:ajaxify.start", function (data) {
      // Improved logging by destructuring the data object
      const { url } = data;
      UniMap.console.log("🔜 Starting AJAX request for URL:", url);
    
     
     // UniMap.api.detectMapViewport();
    
      // Use optional chaining to safely access nested properties
      const mapRouter = ajaxify.data.UniMapSettings?.mapPageRouter;
      if (!mapRouter) return;
    
      // Improved variable naming for clarity
      const isPreviousPageMapOrMain = app.previousUrl.includes(mapRouter) || app.previousUrl === '/'; // TODO: determine if map template not in map page in nodebb settings
      const isNextPageMapOrMain = !url || '/' + url === mapRouter; // TODO: determine if map template not in map page in nodebb settings
    
      if (isNextPageMapOrMain) {
        UniMap.console.log("User is navigating back to the map page");
      } else if (isPreviousPageMapOrMain) {
        UniMap.console.log("User is leaving the map page", data, app);
    
        // Encapsulate removal logic into a separate function
        cleanUpMapAndUI();
    
      } else {
        UniMap.console.log("User is navigating between pages", data, app);
      }
    });
    
    // A separate function to handle map and UI removal
    function cleanUpMapAndUI() {
      UniMap.eventListenersInstance.remove();
    
      try {
        UniMap.map.remove();
        UniMap.map = null;
      } catch (error) {
        UniMap.console.log(error);
      }
    
      UniMap.needReinit = true;
      document.body.style.overflow = '';
      document.body.removeAttribute('data-bs-overflow');
    
      // Chained multiple removeClass calls
      $('body').removeClass('far-away-zoom hiddenElements addPlaceMode cards-opened bottomPanelOpened');
    }
    
    
    
    

    hooks.on('action:ajaxify.end', (data) => {
      if(data.tpl_url === 'map'){
           
            if(UniMap.firstInitTime < Date.now()-1000 || UniMap.needReinit){
              if(app.user.isAdmin){
                   console.log('ADMIN ajaxify')
                   reload(UniMap)
               }else{
                  reload(UniMap)
               }
   
   
            } 
   
   
       }else{
           
           


           if(data.tpl_url === 'post'){
             
           }



       }
   
      
       UniMap.console.log("🔚", data);
     });

     hooks.on("action:ajaxify.coldLoad", function (data) {
      UniMap.console.log("~ coldLoad", data);
    });

  };



  




});