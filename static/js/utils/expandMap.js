'use strict';
define('utils/expandMap',["core/variables" /*   Global object UniMap  */], function(UniMap) { 
 
      UniMap.api.expandMap = async (id) => {
        //UniMap.console.log(`  UniMap.api.expandMap id ${id}`)
      
      //UniMap.api.markerIterator.stop();
      UniMap.api.fancyHeroText.stop();
    
     
      $('body').removeClass('before-map-expand')
  
      if ($('body').hasClass('map-touched')) {
        return false;
      } else {
  
       // const scrollOffset = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        // if (scrollOffset > 1) {
        //   UniMap.api.animateScroll(0, document.getElementById('ua-dragger'), 400);
        // }
  
        UniMap.mapExpanded = true;
        UniMap.api.hideBrandTitle(true);
       
        UniMap.map.scrollWheelZoom?.enable();
        
        
        $('body').addClass('map-touched');
        
       
       
        await new Promise((resolve) => setTimeout(resolve, 1000)); 
    
        UniMap.api.fitElementsPosition();
    
        if ($(window).innerWidth() > 2100 && !$('body').hasClass('linked-location')) {
         // TODO: removed old sidebar
        }
    
      
        UniMap.api.disablePropagationToMap(null)
  
        UniMap.setTimeout(() => {
          UniMap.api.updateCSS();
          $('#mapHero').remove()
  
  
          UniMap.api.populateAdvMarkers()
  
        }, 1000);
  
  
        return true;
      }
    };
  
  
  
    return UniMap
  })
  
  