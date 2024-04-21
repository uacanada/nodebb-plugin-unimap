"use strict";

    function setPlaceMap(L, place, ajaxed) {
       if(place.latlng?.length === 2){
            var latlng = place.latlng;
            var accessToken = ajaxify.data?.UniMapSettings?.mapBoxApiKey|| '';
            var pinMarkerIcon = L.divIcon({
                className: "ua-pin-icon",
                html: '<div class="position-relative"><span class="mini-latlng-inpost position-absolute">' +  place.placeTitle + '</span><span class="ua-bounce-animated-pin">📍</span></div>',
                iconSize: [25, 25],
                iconAnchor: [15, 30],
                popupAnchor: [5, -5],
            });
            
            var mapbox =  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + accessToken, {
                maxZoom: 19,
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1,
                accessToken: accessToken
            });

            var osm = L.tileLayer( "https://tile.openstreetmap.org/{z}/{x}/{y}.png")

            var layer = accessToken && accessToken.length > 40 ? mapbox:osm
            
            var minimap = L.map("topicMap", {
                attributionControl: true,
                scrollWheelZoom: false,
                dragging: false,
                paddingBottomRight: [50, 0],
                contextmenu: false,
                center: latlng,
                zoom: 13,
                layers: [layer],
                tap: false,
                minZoom: 8,
                zoomControl: true,
            });
            
            L.marker(latlng, { icon: pinMarkerIcon }).addTo(minimap);
            
            /*
            MOVE MARKER TO TOP OF THE MAP
            var zoom = minimap.getZoom();
            var point = minimap.project(latlng, zoom);
            point.y = point.y + 40;
            var newlatlng = minimap.unproject(point, zoom);
            minimap.panTo(new L.LatLng(newlatlng.lat, newlatlng.lng));
            */
            
        }
    
        
    
    }

    function loadSwiperCSS(filename) {
        if (!$('link[href="' + filename + '"]').length) {
            let file = document.createElement("link");
            file.setAttribute("rel", "stylesheet");
            file.setAttribute("type", "text/css");
            file.setAttribute("href", filename);
    
            document.head.appendChild(file);
        }
    }

    function initSwiper(){
        const topicPlaceSwiper = new Swiper("#topicPlaceGallery", { slidesPerView: "auto",  mousewheel:true,  freeMode: true })
    }
    
   
    
    
     
    
    $(window).on("action:ajaxify.end", function (event, data) {
        const place = ajaxify?.data?.mapFields;
        const modulespath = '/assets/plugins/nodebb-plugin-unimap/'
        if (place?.placeCategory) {

            if (window.L?.version) {
                setPlaceMap(window.L, place, false);
            } else {
                $.getScript( modulespath+"leaflet/leaflet.js",
                    function () {
                        setPlaceMap(window.L, place, true);
                    }
                );
            }

            if (window.Swiper?.name) {
                initSwiper()
               
            } else {
                $.getScript(  modulespath+"swiper/swiper-bundle.min.js",
                    function () {
                       
                        initSwiper()
                    }
                );
               
            }
            loadSwiperCSS(modulespath+"swiper/swiper-bundle.min.css");

            $('#topicPlaceGallery .swiper-slide a').off('click').on('click', function(event) {
                event.preventDefault();
            });
            
        }
    });