'use strict';
define('panels/bottomSheets',["core/variables" /*   Global object UniMap  */], function(UniMap) { 



UniMap.api.createBotomPanelCategoryButton = (tab, index) => {
  const { color, icon, slug } = tab;
  return `<div class="swiper-slide showBottomPanel" data-ua-content-id="tab-${slug}"><button title="Open category: ${slug}" type="button"> <i class="fa fa-solid ${icon}" style="color: ${color};"></i></button></div>`;
};


UniMap.api.switchBottomTab = {
  next: function() {
      switchTab('next');
  },
  prev: function() {
      switchTab('prev');
  }
};

async function switchTab(direction) {
  let swiper = UniMap.swipers.bottomPanelCategoryButtons;
  let slidesCount = swiper.slides.length;
  let prevFragmentId = $('.showBottomPanel.active-tab-button').data('ua-content-id')
  let currentIndex =  UniMap.api.findSwipeIdByContentId(prevFragmentId).index;
  
  let nextIndex;
  if (direction === 'next') {
    nextIndex = currentIndex + 1;
    if (nextIndex >= slidesCount) {
        nextIndex = 0;  
    }
  } else if (direction === 'prev') {
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) {
          nextIndex = slidesCount - 1; 
      }
  } else {
      UniMap.console.log("Invalid direction provided. Use either 'next' or 'prev'.");
      return;
  }

  

  $('.showBottomPanel').removeClass('active-tab-button')
  const fragment_id = $(swiper.slides[nextIndex]).data('ua-content-id')
  await UniMap.api.scrollableBottomPanel.slide({fragment_id})
  UniMap.setTimeout(() => {
    UniMap.swipers.bottomPanelCategoryButtons.slideTo(nextIndex)
    UniMap.swipers.bottomPanelCategoryButtons.updateActiveIndex()
    UniMap.swipers.bottomPanelCategoryButtons.updateSlidesClasses()
    $('#bottomPanelCategoryButtons .swiper-slide[data-ua-content-id='+fragment_id+']').addClass("active-tab-button");
    UniMap.console.log({currentIndex,nextIndex,slidesCount,fragment_id})
  },200)

 
}



UniMap.api.findSwipeIdByContentId = (attr) => {
   const slides = UniMap.swipers.bottomPanelCategoryButtons?.slides;
   if(!slides) return { slide: null, index: 0 };
    let foundSlide = null;
    let foundIndex = -1;
    for (let i = 0; i < slides.length; i++) {
      if (slides[i].getAttribute('data-ua-content-id') === attr) {
        foundSlide = slides[i];
        foundIndex = i;
        break;  
      }
    }
    return { slide: foundSlide, index: foundIndex };
};


UniMap.api.loadTabToBottomPanel = async (triggerButton) => {

  function showEmtyTab(htmlstring){
    $('#sheet-content-loader').html(htmlstring) // TODO: move to ACP
   }
  
  
  if(!triggerButton){
    return {buttonIndex:0,contentId:null}
  }

 
  const hasFragmentContent = triggerButton.fragment_id && UniMap.fragment.fragments[triggerButton.fragment_id]
  const fragmentWithoutContent = triggerButton.fragment_id && !hasFragmentContent

  if(hasFragmentContent){
    UniMap.fragment.loadFragmentToElement(triggerButton.fragment_id, 'sheet-content-loader',null,true);
    return {buttonIndex:0,contentId:triggerButton.fragment_id, fragment:true}
  }

 
  let contentId =  triggerButton[0]?.getAttribute("data-ua-content-id") || triggerButton.fragment_id
  if(!contentId || fragmentWithoutContent){
    showEmtyTab(UniMap.emptyTabMessage)
    return {buttonIndex:0,contentId:triggerButton.fragment_id}
  }

  $('.showBottomPanel').removeClass('active-tab-button');
  let buttons = UniMap.swipers.bottomPanelCategoryButtons

  if(!buttons || buttons.destroyed || !UniMap.api.scrollableBottomPanel.openedButtons){
     // Create new swiper with category buttons
    let fragmentCloneButtons = UniMap.fragment.fragments.bottomPanelCategoryButtons.cloneNode(true);
    $("#bottomPanelCategoryButtons").html(fragmentCloneButtons.childNodes);
    UniMap.swipers.bottomPanelCategoryButtons = new UniMap.Swiper("#bottomPanelCategoryButtons", { slidesPerView: "auto",  freeMode: true })
    let hasSlides = UniMap.swipers.bottomPanelCategoryButtons.slides.length > 0
    UniMap.api.scrollableBottomPanel.setPanelState( { openedButtons: hasSlides, hidingButtons: hasSlides});
  }
  
  let buttonIndex = UniMap.api.findSwipeIdByContentId(contentId).index;
  if(UniMap.fragment.fragments[contentId]){
    UniMap.fragment.loadFragmentToElement(contentId, 'sheet-content-loader',null,true);
    return {buttonIndex,contentId}
  } else {
    
    if(contentId == 'tab-widgets'){
      showEmtyTab('<div class="mt-3 p-3 text-center fs-5"><p><i class="fa-solid fa-eye-slash"></i> This [tab-widgets] is currently empty. Add a widget in your ACP!</p></div>')
    } else {
      showEmtyTab('<div class="mt-3 p-3 text-center fs-5"><p><i class="fa-solid fa-eye-slash"></i> This tab ['+contentId+'] is currently empty. [error] </p><p class="newLocationOpenMarker btn btn-primary">Would you like to add your own location to the map?</p></div>')
    }
    return {buttonIndex,contentId}
  }

}


UniMap.api.addCategoryButtons = async (buttonIndex,contentId) => {

  let buttonsVisibleBefore = UniMap.api.scrollableBottomPanel.openedButtons || !UniMap.api.scrollableBottomPanel.hidingButtons 
  $("#bottomButtonsWrapper").addClass("shown");
  if(!buttonsVisibleBefore) UniMap.swipers.bottomPanelCategoryButtons.slideTo(buttonIndex);
  $('#bottomPanelCategoryButtons .swiper-slide[data-ua-content-id='+contentId+']').addClass("active-tab-button");
  UniMap.swipers.bottomPanelCategoryButtons.updateActiveIndex(buttonIndex)
  UniMap.swipers.bottomPanelCategoryButtons.updateSlidesClasses()


}


UniMap.api.saveWidgetsToFragment = ()=> {
  try {
    if(ajaxify.data.widgets['unimap-pull-up-panel']){
      let widgetsHtml = '';
      ajaxify.data.widgets['unimap-pull-up-panel'].forEach((widget)=> {
            widgetsHtml+=widget.html
       })
      UniMap.fragment.createFragment('tab-widgets',widgetsHtml)
      widgetsHtml = null
      }
  } catch (error) {
    UniMap.console.log(error)
  }
  
}

/**
 * @function UniMap.api.scrollableBottomPanel.open
 * @description Opens a scrollable bottom panel with the given content.
 *
 * @param {HTMLElement|Object} input - The content to be displayed in the panel. 
 *                                    It can either be an HTML element or an object containing the `fragment_id`.
 * 
 * ## Examples:
 * 
 * ### Using an HTML Element
 * To open the panel with a specific HTML element (e.g., a div with `data-ua-content-id="tab-all"`), 
 * you can pass the element directly to the function.
 * ```javascript
 * UniMap.api.scrollableBottomPanel.open(htmlElement);
 * ```
 * 
 * ### Using a Fragment ID
 * Alternatively, you can open the panel using a pre-declared fragment ID.
 * ```javascript
 * UniMap.api.scrollableBottomPanel.open({fragment_id: 'nameOfFragment'});
 * ```
 * 
 * ### Declaring a Fragment
 * To declare a fragment, you can use `UniMap.fragment.createFragment()`.
 * ```javascript
 * UniMap.fragment.createFragment('fragment_id', '<div>Html String</div>');
 * ```
 *   let widgetsHtml = '';
 *   ajaxify.data.widgets['unimap-pull-up-panel'].forEach((widget)=> {
 *        widgetsHtml+=widget.html
 *   })
 *   UniMap.fragment.createFragment('widgetsHtml',widgetsHtml)
 * 
 */

const PANEL_SCROLL_HEIGHT = Math.floor(window.innerHeight / 2); // TODO: move magic numbers to ACP
UniMap.api.scrollableBottomPanel = {

  setPanelState: function(state) {
    for (const [key, value] of Object.entries(state)) {
      UniMap.api.scrollableBottomPanel[key] = value;
    }
  },

  toggleBodyClass: function(isOpened) {
    $("body").toggleClass("bottomPanelOpened", isOpened);
  },

  getPanel: function() {
    return $('#scrollableBottomPanel');
  },

  open: async function(reason) {
      UniMap.console.log('scrollableBottomPanel.open ',reason)
      if(reason === "tab-close-panel") UniMap.api.scrollableBottomPanel.close()
      let {buttonIndex,contentId} = await UniMap.api.loadTabToBottomPanel(reason)
      const panel = this.getPanel();
      panel.show().attr('aria-hidden', 'false');
      this.toggleBodyClass(true);
      this.setPanelState( { opened: true, hiding: false });
      UniMap.setTimeout(() => {
        UniMap.api.addCategoryButtons(buttonIndex,contentId) 
        this.setPanelState( { openedButtons: true, hiding: false, hidingButtons: false });
        UniMap.api.shakeElements(["#sheet-content-loader"], "ua-shake-vert");
        panel.removeClass('panel-hidden').addClass('panel-shown');
        $("#innerScrollPanel").animate({ scrollTop: PANEL_SCROLL_HEIGHT }, 300, "swing");
      }, 100);   
  },

  slide: function (fragment){
    UniMap.api.shakeElements(["#sheet-content-loader"], "ua-shake-vert"); // TODO: make horizontal
    UniMap.api.loadTabToBottomPanel(fragment)

  },

  close: function() {
    
    if(!UniMap.api.scrollableBottomPanel.opened || !UniMap.api.scrollableBottomPanel.openedButtons ) return;

    const panel = this.getPanel();
    $("#innerScrollPanel").animate({ scrollTop: 0 }, 300);
    panel.removeClass('panel-shown').addClass('panel-hidden').attr('aria-hidden', 'true');
    this.toggleBodyClass(false);
    this.setPanelState( { openedButtons: false, opened: false, hiding: true, hidingButtons: true });
    $("#bottomButtonsWrapper").removeClass("shown");

    UniMap.setTimeout(() => {
      if (!UniMap.api.scrollableBottomPanel.hiding) return;
        
      panel.hide();
      try {
        UniMap.swipers.bottomPanelCategoryButtons.destroy(true,true)
      } catch (error) {
        UniMap.console.log(error)
      }
     $('#sheet-content-loader').html('')
     $("#bottomPanelCategoryButtons").html('');

     this.setPanelState( { openedButtons: false, opened: false, hiding: false, hidingButtons: false });
     
     UniMap.swipers.bottomPanelCategoryButtons = null
    }, 1500);
  }
};

})
