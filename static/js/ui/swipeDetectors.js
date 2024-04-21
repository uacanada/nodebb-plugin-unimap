'use strict';
define('ui/swipeDetectors',["core/variables" /*   Global object UniMap  */], function(UniMap) { 

    UniMap.api.swipeDetectorZones = {
        '#cardsSwiperPlaceholder': {handle:cardCarousel,swipeResistance:50},
        '#ua-place-modal .offcanvas-body': {handle:postOffcanvas},
        '[component="bottombar"]':{handle: bottomNav},
        '#innerScrollPanel': {handle:bottomScrollablePanel}
      };

  UniMap.api.swipeZonesRegister = () => {
        UniMap.api.swipeDetectorListeners = [];
    
        // Register
        Object.entries(UniMap.api.swipeDetectorZones).forEach(([selector, prop]) => {
          const registration = UniMap.api.listenSwipes(selector, prop.handle, prop.swipeResistance);
          registration.register();
          UniMap.api.swipeDetectorListeners.push(registration);
        });
  }

    UniMap.api.swipeZonesUnregister = () => {
    // Unregister
            UniMap.api.swipeDetectorListeners.forEach((registration) => {
            registration.unregister();
        });
    }



  function bottomScrollablePanel(direction, element){

 
    if(direction==='down' && $('#innerScrollPanel').scrollTop() < 1) {

      UniMap.console.log(`Force scrollableBottomPanel.close() cause:  scrollTop:`. $('#innerScrollPanel').scrollTop())
       UniMap.api.scrollableBottomPanel.close() 
    } 

    if(direction==='right') {
      UniMap.api.switchBottomTab.prev()
    } 

    if(direction==='left') {
      UniMap.api.switchBottomTab.next()
    } 


  }
  

  function cardCarousel(direction, element) {

    let isVertical = UniMap.swipers.cardsCarousel.isVertical()
    let verticalInBeginning = isVertical && UniMap.swipers.cardsCarousel.isBeginning

    if (direction==='up' && !isVertical) {
        UniMap.api.openPlaceModal()
    }  

    
   if (direction==='down' && !isVertical) {
        $("body").removeClass("ua-noscroll");
        $("#ua-place-modal").offcanvas("hide");
        UniMap.api.removeCards()
    } 


    if (direction==='down' && verticalInBeginning) {
      UniMap.api.rotateCards("horizontal");
    } 

  }
  
  function postOffcanvas(direction, element) {
    if(direction==='down'){
        $("#ua-place-modal").offcanvas("hide");
    }
    
  }

  function bottomNav (direction, element) {
    if(direction==='up'){
        UniMap.api.scrollableBottomPanel.open() // TODO: add default content when swipe on nav bar
    }
    
  }
 
  

  
UniMap.api.listenSwipes = (querySelector, callback, swipeResistance = Number(ajaxify.data.UniMapSettings.swipeResistance), diagonalThreshold = 50) => {
    const elements = document.querySelectorAll(querySelector);
    
  
    if (!swipeResistance) return console.warn("Need set swipeResistance");
  
    const handleGesture = (startX, startY, endX, endY) => {
      const deltaX = endX - startX;
      const deltaY = endY - startY;
  
      if (Math.abs(deltaX) < swipeResistance && Math.abs(deltaY) < swipeResistance) {
        return null; // Ignore accidental swipes
      }
  
      if (Math.abs(deltaX - deltaY) <= diagonalThreshold) {
        return null; // Ignore diagonal swipes
      }
  
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > swipeResistance ? 'right' : 'left';
      } else {
        return deltaY > swipeResistance ? 'down' : 'up';
      }
    };
  
    const eventListeners = [];
  
    elements.forEach(element => {
      const touchStart = function(event) {
        this.startX = event.changedTouches[0].screenX;
        this.startY = event.changedTouches[0].screenY;
      };


      const touchEnd = function(event) {
        const endX = event.changedTouches[0].screenX;
        const endY = event.changedTouches[0].screenY;
        const direction = handleGesture(this.startX, this.startY, endX, endY);
        
        const isScrollable = element.scrollHeight > element.clientHeight;
        
        if (isScrollable) {
          // Ignore swipe down if not fully scrolled to the top
          if (element.scrollTop > 0 && direction === 'down') {
            return;
          }
          
          // Ignore swipe up if not fully scrolled to the bottom
          if (element.scrollTop < element.scrollHeight - element.clientHeight && direction === 'up') {
            return;
          }
        }
        
        if (direction) {
          callback(direction, element);
        }
      };
      

  
      element.addEventListener('touchstart', touchStart);
      element.addEventListener('touchend', touchEnd);
      eventListeners.push({element, touchStart, touchEnd});
    });
  
    return {
      register() {
        eventListeners.forEach(({element, touchStart, touchEnd}) => {
          element.addEventListener('touchstart', touchStart);
          element.addEventListener('touchend', touchEnd);
        });
      },
      unregister() {
        eventListeners.forEach(({element, touchStart, touchEnd}) => {
          element.removeEventListener('touchstart', touchStart);
          element.removeEventListener('touchend', touchEnd);
        });
      }
    };
};
  


})