'use strict';
define('events/mapReady',["core/variables" /*   Global object UniMap  */], function(UniMap) { 
    
    UniMap.api.disablePropagationToMap = (className) => {
        const {L} = UniMap
        const querySelector = className||'.no-propagation';
        const elements = document.querySelectorAll(querySelector);
        const events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove', 'contextmenu','touchstart'];
        elements.forEach(function(element) {
            L.DomEvent.disableClickPropagation(element);
            L.DomEvent.disableScrollPropagation(element);
        });
    };


    UniMap.api.afterMapReloadFirstTime = () => {
        UniMap.console.log(`Start: ${UniMap.firstInitTime}   Now: ${Date.now()}`)

    }

    UniMap.api.afterMapReloadNotFirstTime = () => {
        UniMap.console.log(`Reload: ${UniMap.firstInitTime}   Now: ${Date.now()}`)
        const {map} = UniMap
        
        if (map && !window.location.search && $("body").hasClass(UniMap.mapRoomClass)  ) { // TODO Check
            // if back from topic page and zoom is too big - do zoom out
            if (map.getMaxZoom() === map.getZoom() ||  map.getMaxZoom() < map.getZoom() + 2) {
                map.zoomOut(4);
            }
        }

        UniMap.api.disablePropagationToMap(null)
        UniMap.api.rotateCards("horizontal");
        UniMap.api.animateCards("close");
        UniMap.api.addAtrribution("#uacamap"); 
        $('#ua-horizontal-buttons-wrapper').removeClass('movedown hidden')
        $('#geocoderSearchbox').removeClass('show')

        UniMap.uaEventPartFormHTML = $("#ua-form-event-holder").html(); // TODO: move to fragments
        $('#place-tag-input').tagsinput({  maxChars: 24, maxTags: 10, tagClass: "badge bg-info", confirmKeys: [13, 44], trimValue: true}); // INIT later
        

        
    }


    UniMap.api.mapReLoad = async () => {
        
        UniMap.api.updateCSS();
        UniMap.api.fitElementsPosition();
        UniMap.api.detectUrlParam();
        UniMap.api.fancyHeroText.start();
        $('body').addClass('before-map-expand').removeClass('far-away-zoom hiddenElements addPlaceMode cards-opened bottomPanelOpened');
        $('#bottomButtonsWrapper').removeClass('shown')
        $('#scrollableBottomPanel').removeClass('panel-shown')
        UniMap.isFullscreenMode = false;
        
        UniMap.setTimeout(() => {
          if (UniMap.firstInitTime < Date.now() - 1000) {
            UniMap.api.afterMapReloadNotFirstTime();
          } else {
            UniMap.api.afterMapReloadFirstTime();
          }
        }, 1000);
        

            
    };
})