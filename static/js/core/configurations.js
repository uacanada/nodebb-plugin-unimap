'use strict';
define('core/configuration', function (require) {
    const L = require('leaflet');
    const Swiper = require('swiper/bundle').default;
    const UniMap = require('core/variables');
    require('leaflet-fullscreen');
    require('leaflet-control-geocoder');
    require('leaflet.markercluster');
    require('leaflet.locatecontrol');
    require('leaflet-contextmenu');
    require('leaflet-providers');
    
    
    const dateTime = new Date(Date.now());
    UniMap.L = L
    UniMap.Swiper = Swiper
    
    const { mapPageRouter, initialCoordinates, mapBoxApiKey, countryLimit, bottomRightCorner, topLeftCorner } = ajaxify.data.UniMapSettings;

    UniMap.timestampNow = Math.floor(dateTime / 1000);
    UniMap.weekDay = UniMap.weekdays[dateTime.getDay()];
    UniMap.userRegistered = app.user.uid && app.user.uid > 0;
    UniMap.adminsUID = app.user.isAdmin;
    UniMap.markerSettings = {
      virtZoom: 16,
      shiftX: 100,
      shiftY: 100,
      lngDistanceTtrigger: 110,
      latDistanceTtrigger: 45,
    };
  
    UniMap.contextButton = {
      router: {
        text: 3,
        main: 0,
        cards: 1,
        addplace:4
      },
    };
  
    const generateRoute = (endpoint) =>
      `/api/v3/plugins${mapPageRouter}${endpoint}`;
  
    UniMap.routers = {
      mapPage: mapPageRouter,
      addplace: generateRoute("/addplace"),
      getplace: generateRoute("/getplace"),
      getplaces: generateRoute("/getplaces"),
    };
  
    UniMap.defaultLatLng = initialCoordinates
      ? initialCoordinates.split(",").map(Number)
      : [49.28269013417919, -123.12086105346681]; // Fallback
  
   
    UniMap.geocoderOptions = {
        apiKey: mapBoxApiKey,
        ...(countryLimit ? { geocodingQueryParams: { country: countryLimit } } : {}),
      };
      

    UniMap.api.configureMapElements = () => {

        const {L} = UniMap 

        if(UniMap.map){
            try {
                UniMap.map.remove()
            } catch (error) {
                UniMap.console.log(error)
            }
            UniMap.map = null
        }

        
        const OSM = L.tileLayer( "https://tile.openstreetmap.org/{z}/{x}/{y}.png",  { maxZoom: 19 }  );

        UniMap.isMapBoxKeyExist = ajaxify.data.UniMapSettings.mapBoxApiKey?.length > 30

        UniMap.mapLayers.MapBox = UniMap.isMapBoxKeyExist ? L.tileLayer.provider("MapBox", { id: "mapbox/streets-v11",  accessToken:ajaxify.data.UniMapSettings.mapBoxApiKey}):OSM;
        
        
        UniMap.mapProviders = {
            MapBox: UniMap.mapLayers.MapBox,
            OSM,
            Minimal: L.tileLayer.provider("Esri.WorldGrayCanvas"),
            Satellite: L.tileLayer.provider("Esri.WorldImagery"),
            Classic: L.tileLayer.provider("Esri.NatGeoWorldMap"),
        };


        UniMap.icon = L.divIcon({
            className: "ua-locate-me-marker",
            html: '<div class="spinner-grow spinner-grow-sm" role="status"><span class="visually-hidden">Loading...</span> </div>', // TODO move to settings
            iconSize: [28, 28],
            iconAnchor: [6, 14],
            popupAnchor: [8, -3],
        });
        UniMap.newPlaceMarker = L.divIcon({
            className: "ua-locate-me-marker",
            html: '<div class="spinner-grow spinner-grow-sm" role="status"><span class="visually-hidden">Loading...</span> </div>', // TODO move to settings
            iconSize: [28, 28],
            iconAnchor: [6, 14],
            popupAnchor: [8, -3],
        });
        UniMap.errorMarker = L.divIcon({
            className: "ua-pin-icon",
            html: '<div class="position-relative"><span class="ua-bounce-animated-pin">⛔️</span></div>',  // TODO move to settings
            iconSize: [20, 20],
            iconAnchor: [10, 0],
            popupAnchor: [5, 5],
        });

            // Initialize the main marker cluster group to hold multiple categories
           // UniMap.mapLayers.markers = L.layerGroup();

            // Initialize category-specific cluster groups
            UniMap.categoryClusters = {};


            function createCluster(category){
                UniMap.categoryClusters[category.slug] = L.markerClusterGroup(
                    {
                        disableClusteringAtZoom: 17,
                        maxClusterRadius: 90, // TODO move to ACP
                        spiderfyDistanceMultiplier: 1,
                        spiderfyOnMaxZoom: false,
                        showCoverageOnHover: false,
                        zoomToBoundsOnClick: true,
                        // removeOutsideVisibleBounds:true, // TODO check bugs
                        iconCreateFunction: function (cluster) {
                            const markers = cluster.getAllChildMarkers();
                            const count = markers.length;
                            const iconSize = Math.min(Math.max(Math.floor((count * 3) + 33), 32), 48);

                            const anchorSize = iconSize / 2;
                            return L.divIcon({
                              html:`<div class="cluster-icon">
                              <div class="badge-number">${count}</div>
                              <div class="icon-wrapper">
                                <i class="fas fa-home"></i>
                                <i class="fas fa-cut"></i>
                                <i class="fas fa-car"></i>
                                <i class="fas fa-heart"></i>
                                <i class="fas fa-hospital"></i>
                              </div>
                            </div>
                            `, // TODO revise cluster icon and move to ACP
                              className: "unimapcluster",
                              iconSize: L.point(iconSize, iconSize),
                              iconAnchor: [anchorSize, anchorSize]
                            });
                        },
                        spiderfyShapePositions: function (count, centerPt) {
                            var distanceFromCenter = 33,
                                markerDistance = 33,
                                lineLength = markerDistance * (count - 1),
                                lineStart = centerPt.y - lineLength / 2,
                                res = [],
                                i;
        
                            res.length = count;
        
                            for (i = count - 1; i >= 0; i--) {
                                res[i] = L.point(
                                    centerPt.x + distanceFromCenter,
                                    lineStart + markerDistance * i
                                );
                            }
        
                            return res;
                        },
                        spiderLegPolylineOptions: {
                            weight: 1,
                            color: "#000",
                            opacity: 0.4,
                            dashArray: "5, 5",
                        },
                    }
                );
            }

        createCluster({slug:'allMarkersCluster'})
        ajaxify.data.UniMapSettings.subCategories.forEach((category) => {  createCluster(category) });
        UniMap.markersOverlay = {};
            for (const category in UniMap.categoryClusters) {
                const clusterGroup = UniMap.categoryClusters[category];
                UniMap.markersOverlay[category] = clusterGroup
            }
        UniMap.api.addLeafletButton = ({position='bottomright', classes, title, icon, btnclasses, attributes='', extendedhtml=''}) => L.Control.extend({
                options: { position, title},
                onAdd() {
                const container = L.DomUtil.create('div', `leaflet-control ${classes}`);
                container.innerHTML = `<button type="button" title="${title}" class="btn circle-button ${btnclasses}" ${attributes}><i class="${icon}"></i></button>${extendedhtml}`;
                return container;
                }
            });
           
                
        UniMap.mapLayers.removeCardsButton =  new (UniMap.api.addLeafletButton({classes: 'removeCards mb-5', title: 'Remove Cards', icon: 'fa fa-solid fa-xmark',btnclasses:'btn-danger'}));
        UniMap.mapLayers.rotateCardsButton =  new (UniMap.api.addLeafletButton({classes: 'rotateCards', title: 'Rotate Cards', icon: 'fa fa-solid fa-table-list',btnclasses:'btn-primary'})); 
        UniMap.mapLayers.addPlaceButton = new (UniMap.api.addLeafletButton({classes: 'leaflet-control-addplace newLocationOpenMarker', title: 'Add New Place', icon: 'fa fa-solid fa-map-pin',btnclasses:'btn-primary'}));
        UniMap.mapLayers.filterPlacesButton = new (UniMap.api.addLeafletButton({classes: "filterPlaces btn-group dropup",  title: "Filter Places",  icon: "fa fa-fw fa-sliders",  btnclasses: "btn btn-blur dropdown-toggle", 
               attributes:`data-bs-toggle="dropdown" aria-expanded="false"`,
                extendedhtml:`<div class="dropdown-menu custom-ua-dropdown">  <a class="ua-sort list-group-item list-group-item-action d-flex align-items-center border-bottom"
                data-ua-sortby="distance" href="#">
                <i class="fas fa-road me-2"></i> Distance
            </a>
            <a class="ua-sort list-group-item list-group-item-action d-flex align-items-center border-bottom"
                data-ua-sortby="latest" href="#">
                <i class="fas fa-hourglass-start me-2"></i> Latest
            </a>
            <a class="ua-sort list-group-item list-group-item-action d-flex align-items-center border-bottom"
                data-ua-sortby="oldest" href="#">
                <i class="fas fa-hourglass-end me-2"></i> Oldest
            </a>
            <a class="ua-sort list-group-item list-group-item-action d-flex align-items-center border-bottom"
                data-ua-sortby="events" href="#">
                <i class="fas fa-calendar-alt me-2"></i> Event Date
            </a>
            <a class="ua-sort list-group-item list-group-item-action d-flex align-items-center border-bottom"
                data-ua-sortby="category" href="#">
                <i class="fas fa-folder me-2"></i> Category
            </a>
            <div class="list-group-item">
                <select id="location-category-filter" name="categoryfilter" class="form-select w-100 rounded-pill"
                    aria-label="category"></select>
            </div></div>` }));

         
        UniMap.mapLayers.locateControl = UniMap.L.control.locate({  position: "bottomright",  flyTo: true,  maxZoom: 16,  strings: { title: "Show me where I am" },});
        UniMap.mapLayers.zoomControl = UniMap.L.control.zoom({ position: "bottomright" });
        UniMap.mapControlsUnused.layerControl = L.control.layers(  UniMap.mapProviders,  UniMap.markersOverlay,  { position: "topright" }  );
        UniMap.mapLayers.tileChooser = new (UniMap.api.addLeafletButton({  classes: "tileChooser btn-group dropup",  title: "Tile Providers",  icon: "fa fa-solid fa-layer-group",  btnclasses: "btn btn-blur dropdown-toggle", attributes:`data-bs-toggle="dropdown" aria-expanded="false"`, extendedhtml:`<div class="dropdown-menu custom-ua-dropdown"><div id="tile-chooser"></div></div>` }));
        
        const myFullscreen = UniMap.L.Control.Fullscreen.extend({ options: {  pseudoFullscreenClass: "fa fa-expand" }  });
        UniMap.mapLayers.fsControl = new myFullscreen({ position: "bottomright" });
        UniMap.hiddenControls.geocoder = UniMap.L.Control.geocoder({
            defaultMarkGeocode: false,
            position: "topright",
            query: "",
            placeholder: "Search here",
            geocoder: UniMap.L.Control.Geocoder.mapbox(UniMap.geocoderOptions),
        });
  
    }
	

    UniMap.api.mapInit = () => {
        
        UniMap.DEFAULT_ZOOM = ajaxify.data.UniMapSettings.defaultZoom ? Number(ajaxify.data.UniMapSettings.defaultZoom) :11; 
        const parseCoords = corner => corner ? corner.split(",").map(coord => Number(coord.trim())) : null;
    
        const bottomRight = parseCoords(bottomRightCorner);
        const topLeft = parseCoords(topLeftCorner);
    
        if (bottomRight && topLeft) {
            UniMap.bounds = L.latLngBounds(L.latLng(...topLeft), L.latLng(...bottomRight));
        }


       
    
        UniMap.map = UniMap.L.map("uacamap", {
            zoomSnap: 1, // TODO: move to ACP
            wheelDebounceTime: 200,
            wheelPxPerZoomLevel: 200,
            attributionControl: true,
            zoom: UniMap.DEFAULT_ZOOM,
            minZoom: ajaxify.data.UniMapSettings.maxZoomOut? Number(ajaxify.data.UniMapSettings.maxZoomOut): 2, 
            maxBounds: UniMap.bounds, 
            tap: false,
            zoomControl: false,
            contextmenu: true,
            contextmenuWidth: 330,
            contextmenuItems: [{
                text: '<div class="spinner-grow spinner-grow-sm" role="status"><span class="visually-hidden">Loading...</span></div> Create new place here?</br><button type="button" class="btn btn btn-link p-2">Yes</button>', // TODO: move text to ACP
                callback: handleContextMenuClick,
            }],
            center: UniMap.latestLocation.latlng,
        })
      
    
        if (UniMap.bounds) {
            UniMap.map.fitBounds(UniMap.bounds);
        }

        UniMap.map.setView(UniMap.latestLocation.latlng, UniMap.DEFAULT_ZOOM);
    }
    


    UniMap.api.addMapLayers = () => {
        Object.values(UniMap.mapLayers).forEach(addMapLayer);
    }
    
	
	UniMap.api.addMapControls = () => {
        Object.values(UniMap.hiddenControls).forEach(handleControlAddition);
        const $buttonContainer = $('#tile-chooser');
        $.each(UniMap.mapProviders, (providerName) => {
            const $button = $('<button/>', {
                id: `provider-button-${providerName}`,
                class: 'provider-button d-block w-100',
                text: providerName,
                // css: { backgroundImage: `url('/path/to/${providerName}-image.png')`, // Replace with your own image path pattern  },
                click: () => {  UniMap.switchMapProvider(providerName);  },
            });
    
            $buttonContainer.append($button);
        });
    }
    

    UniMap.switchMapProvider = (newProvider) => {
		if (UniMap.currentMapProvider) {
			UniMap.map.removeLayer(UniMap.currentMapProvider);
		}
	
		UniMap.currentMapProvider = UniMap.mapProviders[newProvider];
		UniMap.map.addLayer(UniMap.currentMapProvider);
        UniMap.api.addAtrribution("#uacamap"); 
	}


    function handleContextMenuClick(e) {
        try {
            const lat = e.latlng?.lat || e.latlng[0];
            const lng = e.latlng?.lng || e.latlng[1];
    
            if (!lat || !lng) {
                return console.warn('Location error');
            }
     $("#ua-latlng-text").val(`${lat},${lng}`);
     UniMap.api.createMarkerAtLocation(e, false);
        } catch (error) {
            UniMap.console.log(error);
        }
    }
    
   


    function addMapLayer(layer) {
        try {
            layer.addTo(UniMap.map);
        } catch (error) {
            UniMap.console.log(error)
        }
        
    }
    
    function handleControlAddition(layer) {
        try {
            $("#geocoderSearchbox").append(layer.onAdd(UniMap.map))
        } catch (error) {
            handleControlError(layer, error);
        }
    }
    
    function handleControlError(layer, error) {
        layer.addTo(UniMap.map);
        const controlDiv = layer.getContainer();
        const controlDivCopy = controlDiv.cloneNode(true);
    
        $("#geocoderSearchbox").append(controlDivCopy);
      
    }

   


    return UniMap;


})



