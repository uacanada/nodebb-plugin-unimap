

let tabRouteObject = {};

'use strict';
define('utils/methods', ["core/variables" /*   Global object UniMap  */], function(UniMap) {

  const LOCATION_MARKER_OFFSET_X = 92;
  const LOCATION_MARKER_OFFSET_Y = 48;
  const ANIMATION_DURATION = 300;
  const FADE_OUT_DURATION = 200;
  
  UniMap.api.locationSelection = {
    isVisible: false,  // Changed from 'visible' to 'isVisible' for clarity
    isAnimating: false,
  
    toggleVisibility: function(state) {
      this.isVisible = state;
    },
  
    addMarker: function() {
      if (this.isAnimating) return;
      if (this.isVisible) return this.cleanMarker();  // Exit if the marker is already visible
      this.toggleVisibility(true); 
      this.isAnimating = true;
      $('body').addClass('addPlaceMode')
      $('#geocoderSearchbox').addClass('show')
      $('#ua-horizontal-buttons-wrapper').addClass('hidden')

      if($('body').hasClass('cards-opened')){
        UniMap.api.removeCards()
      }
     
      const mapContainer = $('#uacamap');
      const targetDiv = $('#targetForNewPlace');
      const wrapper =  $('#targetForNewPlaceWrapper');
      const mapCenter = {  x: mapContainer.width() / 2,  y: mapContainer.height() / 2  };
      const targetPosition = {  left: mapCenter.x - LOCATION_MARKER_OFFSET_X,  top: mapCenter.y - LOCATION_MARKER_OFFSET_Y  };
      wrapper.removeClass('d-none')
      $('#targetForNewPlace i.fa-compass').addClass('fa-spin')
      targetDiv.css({
        position: 'absolute',
        left: `${targetPosition.left}px`,
        top: '-300px',
        opacity: 0,
        'z-index': 1000
      });
      UniMap.api.contextButtonText({text:'Drag map to refine spot',delay:ANIMATION_DURATION,to:UniMap.contextButton.router.addplace})
     
      targetDiv.animate({
        left: `${targetPosition.left}px`,
        top: `${targetPosition.top}px`,
        opacity: 1
      }, ANIMATION_DURATION, () => {
        
        this.isAnimating = false; // Reset the state once animation is complete
      });
    },

  
    cleanMarker: function() {
      if (this.isAnimating) return; // Exit if an animation is already running
          this.isAnimating = true; // Set the state to indicate that an animation is in progress

      $('body').removeClass('addPlaceMode')
      $('#geocoderSearchbox').removeClass('show')
      $('#ua-horizontal-buttons-wrapper').removeClass('hidden')
      $('#targetForNewPlace i.fa-compass').removeClass('fa-spin')
      UniMap.api.removeCards()
      UniMap.api.contextButtonText({text:'',delay:0,to:UniMap.contextButton.router.main})
      
      
  
      const targetDiv = $('#targetForNewPlace');
      const wrapper =  $('#targetForNewPlaceWrapper');
  
      targetDiv.animate({
        opacity: 0
      }, FADE_OUT_DURATION, () => {
       
        targetDiv.css({ left:0,top:0});
        wrapper.addClass('d-none')
        this.isAnimating = false;
      });

      if (!this.isVisible) return;  // Exit if the marker is already hidden
  
      this.toggleVisibility(false);

    },

    addPlace: function(){
      UniMap.api.createMarkerAtLocation({latlng: UniMap.map.getCenter()}, false); // cleanMarker also inside
    },
  

    showLatLng: function() {
      try {
        const {lat,lng} = UniMap.map.getCenter();
        $('#locationSelectionLatLng').text(`${lat},${lng}`)
      } catch (error) {
        UniMap.console.log(error)
      }
     
    },
  };
  
  

  // TODO REFACTOR
  UniMap.api.mainFrameShow = (Y) => {
    const currentOpacity = $("#ua-mainframe").css("opacity");
    if (Y && currentOpacity !== "1") {
      $("#ua-mainframe").css("opacity", 1);
    }
    if (!Y && currentOpacity !== "0.2") {
      $("#ua-mainframe").css("opacity", 0.2);
    }
  };

  UniMap.api.detectMapViewport = () => {
    const mapH = $("#uacamap").outerHeight();
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (mapH > 500) {
      if (scrollTop && scrollTop > Math.floor(mapH * 0.7)) {
        UniMap.api.mainFrameShow(false);
      } else {
        UniMap.api.mainFrameShow(true);
      }
    } else {
      UniMap.api.mainFrameShow(true);
    }
  };

  UniMap.api.smoothScroll = (target, duration) => {
    let start = window.scrollY;
    let distance = target - start;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      let timeElapsed = currentTime - startTime;
      let run = ease(timeElapsed, start, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Ease function for smooth animation
    function ease(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
  };
  UniMap.api.animateScroll = (offset, panel, duration) => {
    const currentScroll =
      document.documentElement.scrollTop || document.body.scrollTop || 0;


    return new Promise((resolve, reject) => {
      if (!offset && !currentScroll) {
        resolve({ scrolled: 0 });
      } else {
        const el = panel || document.getElementById("ua-dragger");
        //  el.classList.remove('bounce-scroll');
        $("html, body").animate(
          { scrollTop: Math.min(Math.max(offset || 0, 0), 1e12) },
          duration || 300,
          "swing",
          () => {
            //   el.classList.add('bounce-scroll');
            // gestureDone = true;
            resolve({ scrolled: offset || 0 });
          }
        );
      }
    });
  };

  UniMap.api.setCategory = (category) => {
    if (category) {
      $('#location-category-filter option[value="' + category + '"]').prop(
        "selected",
        true
      );
      $("#location-category-filter").val(category).addClass("filter-active");

      UniMap.api.setButton(category, "active");

      if (UniMap.showCtxButtonOnFilter)
        ctxButton({ show: true, reason: "resetCategory" });
    } else {
      $('#location-category-filter option[value=""]').prop("selected", true);
      $("#location-category-filter").removeClass("filter-active").val("");

      UniMap.api.setButton(false);
      if (UniMap.showCtxButtonOnFilter) ctxButton({ show: false });
    }
    UniMap.api.shakeElements(
      ["#location-category-filter"],
      "accent-animation"
    );
  };

  

  UniMap.api.tryLocate = ({ fornewplace }) => {
    const { map, L } = UniMap;
    map
      .locate({ setView: true, maxZoom: 15 })
      .on("locationfound", function (ev) {
        if (fornewplace) createMarkerAtLocation(ev, false);
      })
      .on("locationerror", function (e) {
        map.setView(UniMap.latestLocation.latlng, 12);
        if (UniMap.currentmarker)
          map.removeLayer(UniMap.currentmarker);
        UniMap.currentmarker = L.marker(
          UniMap.latestLocation.latlng,
          {
            icon: UniMap.errorMarker,
          }
        )
          .addTo(map)
          .bindPopup(ajaxify.data.UniMapSettings.locationSharingErrorAlert)
          .openPopup();

        UniMap.api.showToast(
          "Location Required ",
          'You have not enabled geolocation, but <b>you can manage without it</b>, just move the map until you find the desired point. Make a long tap on the point <i class="fa-regular fa-hand-point-down"></i>',
          "location error"
        );

        UniMap.api.shakeElements(
          [".leaflet-control-geocoder-icon", ".leaflet-control-locate"],
          "ua-shake-element"
        );
      });
  };

  UniMap.api.addNewPlace = () => {
    UniMap.api.expandMap(`addNewPlace`);
    UniMap.api.removeCards();
    UniMap.api.tryLocate({ fornewplace: true });
  };

  UniMap.api.saveMyLocation = () => {
    if (UniMap.userDeniedGeo) return;
    UniMap.map
      .locate({ setView: true, maxZoom: 15 })
      .on("locationfound", function (e) {
        var { lat, lng } = e.latlng;
        localStorage.setItem("uamaplocation", JSON.stringify([lat, lng]));
      })
      .on("locationerror", function (e) {
        UniMap.console.log("location error", e);
        //  $('.leaflet-control-locate').addClass('accent-animation')
        if (e.message.includes("User denied Geolocation")) {
          UniMap.userDeniedGeo = true;
          //  showToast('You denied geolocation! ', 'We cannot find your location because you have blocked this option. Check your browser settings',  'location error');
        }
      });
  };






  UniMap.api.createMarkerAtLocation = (eventData, fromAddress) => {

    if (!eventData || !eventData.latlng) {
      UniMap.console.error("Invalid event data provided to createMarkerAtLocation.",eventData);
      return;
    }


    const defaultAddressProperties = {
      address: "",
      text: "",
      neighborhood: "",
      place: "",
      postcode: "",
      district: "",
      region: "",
      country: ""
    };
  
    try {
      UniMap.api.locationSelection.cleanMarker();
      showCurrentMarkerPopup();
  
      const { map, L } = UniMap;
      const { lat, lng } = eventData.latlng;

  
      UniMap.choosedLocation = [lat, lng];
      saveLocationToStorage(UniMap.choosedLocation);
  
      map.setView(eventData.latlng, 14);
      UniMap.api.clearFormFields();
      updateLatLngText(lat, lng);
  
      if (UniMap.userRegistered) {
        processUserLocation(eventData, fromAddress, map, defaultAddressProperties);
      } else {
        promptUserToRegister(eventData, map, L);
      }
  
      UniMap.api.hideBrandTitle(true);
      toggleFullscreenIfNeeded(map);
    } catch (error) {
      console.error("Error creating marker at location: ", error);
    }
  };
  
  function showCurrentMarkerPopup() {
    if (UniMap.currentmarker) {
      UniMap.currentmarker.bindPopup("Detecting address...").openPopup();
    }
  }
  
  function saveLocationToStorage(location) {
    localStorage.setItem("uamaplocation", JSON.stringify(location));
  }
  
  function updateLatLngText(lat, lng) {
    $("#ua-latlng-text").val(`${lat},${lng}`);
  }
  
  function processUserLocation(eventData, fromAddress, map, defaultAddressProperties) {
    if (!fromAddress && UniMap.isMapBoxKeyExist) {
      reverseGeocodeLocation(eventData.latlng, map);
    } else {
      const addressData = fromAddress || { center:eventData.latlng, properties: defaultAddressProperties };
      UniMap.api.showPopupWithCreationSuggest(addressData);
    }
  }
  
  function reverseGeocodeLocation(latlng, map) {
    UniMap.hiddenControls.geocoder.options.geocoder.reverse(
      latlng,
      map.options.crs.scale(map.getZoom()),
      results => UniMap.api.showPopupWithCreationSuggest(results[0])
    );
  }
  
  function promptUserToRegister(eventData, map, L) {
    UniMap.currentmarker = L.marker(eventData.latlng, {
      icon: UniMap.errorMarker,
    }).addTo(map).bindPopup(ajaxify.data.UniMapSettings.unregisteredUserAlert).openPopup();
    window.location.assign(`${window.location.origin}/register`);
  }
  
  function toggleFullscreenIfNeeded(map) {
    if (UniMap.isFullscreenMode) map.toggleFullscreen();
  }
  




  UniMap.api.createMarkerAtLocationTEST = (event, fromAddress) => {
    UniMap.console.log({event})
    
    const location = event.latlng;
    
    UniMap.api.clearPreviousMarker();
    UniMap.api.setNewMarker(location);
    UniMap.api.updateLocationStorage(location);
    UniMap.api.setViewToLocation(location);
    UniMap.api.clearFormFields();
    UniMap.api.updateLatLngText(location);
  
    if (UniMap.userRegistered) {
      UniMap.api.processRegisteredUser(location, fromAddress);
    } else {
      UniMap.api.alertUnregisteredUser(location);
    }
  
    UniMap.api.adjustMapUI();
  };
  
  UniMap.api.clearPreviousMarker = () => {
    UniMap.api.locationSelection.cleanMarker();
  };
  
  UniMap.api.setNewMarker = (location) => {
    if (UniMap.currentmarker) {
      UniMap.currentmarker.bindPopup("Detecting address...").openPopup();
    }
  };
  
  UniMap.api.updateLocationStorage = (location) => {
    try {
      const { lat, lng } = location;
      UniMap.choosedLocation = [lat, lng];
      localStorage.setItem("uamaplocation", JSON.stringify(UniMap.choosedLocation));
    } catch (error) {
      UniMap.console.log(error)
    }
  
  };
  
  UniMap.api.setViewToLocation = (location) => {
    try {
      UniMap.map.setView(location, 14);
    } catch (error) {
      UniMap.console.log(error)
    }
   
  };
  

  
  UniMap.api.updateLatLngText = (location) => {
    try {
      const { lat, lng } = location;
      $("#ua-latlng-text").val(`${lat},${lng}`);
    } catch (error) {
      UniMap.console.log(error)
    }
   
  };
  
  UniMap.api.processRegisteredUser = (location, fromAddress) => {
    if (!fromAddress && UniMap.isMapBoxKeyExist) {
      UniMap.api.reverseGeocode(location);
    } else {
      try {
        const defaultAddress = UniMap.api.getDefaultAddress(fromAddress);
        UniMap.api.showPopupWithCreationSuggest(defaultAddress);
      } catch (error) {
        UniMap.console.log(error)
      }
     
    }
  };
  
  UniMap.api.getDefaultAddress = (fromAddress) => {
    return fromAddress || { properties: {
      address: "",
      text: "",
      neighborhood: "",
      place: "",
      postcode: "",
      district: "",
      region: "",
      country: "",
    }};
  };
  
  UniMap.api.reverseGeocode = (location) => {
    UniMap.hiddenControls.geocoder.options.geocoder.reverse(
      location,
      UniMap.map.options.crs.scale(UniMap.map.getZoom()),
      (results) => {
        UniMap.api.showPopupWithCreationSuggest(results[0]);
      }
    );
  };
  
  UniMap.api.alertUnregisteredUser = (location) => {
    UniMap.currentmarker = UniMap.L.marker(location, {
      icon: UniMap.errorMarker,
    })
      .addTo(UniMap.map)
      .bindPopup(ajaxify.data.UniMapSettings.unregisteredUserAlert)
      .openPopup();
    window.location.assign(`${window.location.origin}/register`);
  };
  
  UniMap.api.adjustMapUI = () => {
    UniMap.api.hideBrandTitle(true);
    if (UniMap.isFullscreenMode) {
      UniMap.map.toggleFullscreen();
    }
  };
  






  UniMap.api.showPopupWithCreationSuggest = (r) => {
    const { map } = UniMap;
  
    // Error check if r or its expected properties are not defined
    if (!r || !r.center || !r.properties) {
      console.error("Invalid result structure provided to showPopupWithCreationSuggest.",r);
      return;
    }

    let { lat, lng } = r.center;
    let {
      address,
      text,
      neighborhood,
      place,
      postcode,
      district,
      region,
      country,
    } = r.properties;
    
    let popupHtml = "";
  
    // if (country === "Canada") { TODO: Add to ACP Counrty Filter
      let addressIcon = address ? "📮 " : "📍 ";
      let addressLine = r.name; // assuming r.name is defined and is the intended content to show
      let subAdress = `${neighborhood || ''} ${district || ''}, ${region || ''}`.trim();
      popupHtml = UniMap.isMapBoxKeyExist ? `
        <div class="p-1 d-flex flex-column align-items-start">
          <div class="ua-popup-codes">
            <code>${addressIcon}${addressLine}</code></br>
            <code>🗺️ ${subAdress}</code></br>
            <code>🧭 ${lat.toFixed(8)},${lng.toFixed(8)}</code>
          </div>
          <small>You can edit or remove the legal address for privacy in the next step.</small>
          <div class="d-flex mt-2">
            <button title="Confirm creating place here" type="button" class="btn btn-sm btn-primary me-2" data-bs-toggle="offcanvas" data-bs-target="#place-creator-offcanvas">Confirm</button>
          </div>
        </div>
      `:`
      <div class="p-1 d-flex flex-column align-items-start">
        <div class="ua-popup-codes">
          <code>${addressIcon} Address not available</code></br>
          <code>🗺️ Enter address details manually in the next step if known</code></br>
          <code>🧭 Latitude: ${lat.toFixed(12)}</code></br>
          <code>🧭 Longitude: ${lng.toFixed(12)}</code>
        </div>
        
        <div class="d-flex mt-2">
          <button title="Confirm creating place here" type="button" class="btn btn-sm btn-primary me-2" data-bs-toggle="offcanvas" data-bs-target="#place-creator-offcanvas">Confirm</button>
        </div>
      </div>
    `;
  
      $("#uaMapAddress").val(addressLine);
     if(subAdress.length>3){
      $("#subaddress").val(subAdress);
     }
      if (place) $("#ua-newplace-city").val(place);
  
      if (region && UniMap.provinceMapper[region]) {
        $('#location-province option[value="' + UniMap.provinceMapper[region] +  '"' ).prop("selected", true);
      }
    // } else {
    //   popupHtml = `
    //     <b>⁉️ Looks like the location you provided is not in Allowed region: </br>
    //     <code>${country} ${place || ''} ${neighborhood || ''} ${region || ''}</code></br>
    //     Correct your choice on the map!</b></br>
    //   `;
    // }
  
    if (UniMap.currentmarker) {
      map.removeLayer(UniMap.currentmarker);
    }
    
    UniMap.currentmarker = UniMap.L.marker(r.center, {
      icon: UniMap.newPlaceMarker,
    })
      .addTo(map)
      .bindPopup(popupHtml)
      .openPopup();
  
    UniMap.api.removeCards();
  };
  

 

  UniMap.api.setCategoryAndOpenCards = (category) => {
    UniMap.api.rewriteTabsOnCatChange(category);
    UniMap.api.openCards(null, null);
  };

  UniMap.api.rewriteTabsOnCatChange = (category) => {
    $("#location-visible").removeClass("show-top-buttons");
    $("#location-category-filter").removeClass("show-top-buttons");

    UniMap.api.setCategory(category);
    if (UniMap.showOnlyArea) {
      UniMap.api.rewriteTabs("onlyVisibleArea");
      // $('#location-visible').addClass('show-top-buttons')
      UniMap.api.showToast(
        "Area filter",
        "In this mode you see a list of only those locations that are visible on the map",
        "Advisory"
      );
    } else {
      UniMap.api.rewriteTabs("anyLocation");
      // $('#location-visible').removeClass('show-top-buttons')
    }
  };

  UniMap.api.moveMarkerToTop = (c, markerOffset) => {
    const { map, showOnlyArea, L } = UniMap;
    if (showOnlyArea) {
      return;
    }
    var latlng = c.lat ? c : { lat: c[0], lng: c[1] };
    map.setView(latlng, map.getZoom());
    var zoom = map.getZoom();
    var point = map.project(latlng, zoom);
    point.y = point.y + markerOffset;
    var newlatlng = map.unproject(point, zoom);
    map.panTo(new L.LatLng(newlatlng.lat, newlatlng.lng));
  };

  UniMap.api.detectUrlParam = () => {
    const { map } = UniMap;
    $("body").removeClass("post-with-map").removeClass("linked-location");
    var tid = location.search.split("place=")[1] || "";
    if (UniMap.adminsUID)
      

    if (
      map &&
      tid &&
      Number(tid) > 1 &&
      UniMap.allPlaces[tid] &&
      UniMap.allPlaces[tid].gps &&
      UniMap.allPlaces[tid].marker
    ) {
      UniMap.api.expandMap(`detectUrlParam`);
      UniMap.api.animateScroll();
      UniMap.setTimeout(() => {
        var maxZoom = 14;
        map.setView(UniMap.allPlaces[tid].gps, maxZoom);
        $("body").addClass("linked-location");
        UniMap.lastPlaceMarker =
          UniMap.allPlaces[tid].marker.openPopup();
        UniMap.api.openCards(Number(tid), "distance");
      }, 300);
    } else if (
      !tid &&
      map &&
      UniMap.api.isMainPage() &&
      !$("#ua-cards-slider-list")[0]
    ) {
      return; // openCards(null,'latest');
    } else {
      return false;
    }
  };

  UniMap.api.reloadMainPage = () => {
    // TODO need refactoring

    if (!UniMap.preventMultiCall && UniMap.api.isMainPage()) {
      window.location.reload(true);
      location.reload(true);
    }
  };

  
  /**
 * Returns the profile image URL based on the provided place object.
 * Falls back to a default marker image if neither placethumb nor pic is provided.
 *
 * @param {Object} place - Place object containing potential image URLs.
 * @returns {string} - URL of the profile image.
 */
  UniMap.api.getProfileImage = (place) => {
		const placethumb = place.placethumb || '';
		const pic = place.pic || '';
		const baseIcon = placethumb || pic;
		
		// Check if baseIcon is a non-empty string before proceeding
		if (!baseIcon) {
			return '/assets/plugins/nodebb-plugin-unimap/icons/placeMarker.png';
		}

		const profileIcon = baseIcon.includes('/assets/uploads') ? baseIcon : `/assets/uploads${baseIcon}`;
		return profileIcon;
	}


  UniMap.setTimeout = function(callback, delay) {
    let start = null;
  
    function animate(timestamp) {
      if (!start) start = timestamp;
  
      const elapsed = timestamp - start;
  
      if (elapsed >= delay) {
        callback();
      } else {
        requestAnimationFrame(animate);
      }
    }
  
    requestAnimationFrame(animate);
  };


 
  return UniMap;
})
