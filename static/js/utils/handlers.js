'use strict';
define('utils/handlers',["core/variables" /*   Global object UniMap  */], function(UniMap) { 

   
  UniMap.utils = {
    tagsParseJSON: (jsonString) => {
      try {
        let parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    },
  };
  
  
  UniMap.api.onMapFirstLaunch=()=>{
     
      
    UniMap.setTimeout(() => {
          if(!localStorage.getItem("uamaplocation"))  ctxButton({show:true,reason:'setLocation'})
        }, 21000);
      
      }
    
      UniMap.api.isFloodedCall=()=>{
        if(UniMap.blockFlood){   UniMap.blockFloodInterval = UniMap.setTimeout(() => {  UniMap.blockFlood = false;  clearTimeout(UniMap.blockFloodInterval); }, 1000); 
          return true;  }else{  UniMap.blockFlood=true; return false; }
    };
    
    UniMap.api.setClassWithFarawayZoom=(level)=>{
    
        if(level < Number(ajaxify.data.UniMapSettings.zoomThreshold)){
          $('body').addClass('far-away-zoom');
        } else {
          $('body').removeClass('far-away-zoom');
        }
        
      }
    
      UniMap.api.cleanUp=()=>{
        UniMap.allPlaces = {};
        UniMap.allPlacesArray = []
        UniMap.allMarkersMixed = []
        UniMap.TEMP.eventsArray = []
        UniMap.TEMP.placesArray = []
        UniMap.currentSortedMarkers = []
        UniMap.TEMP.tabPopulatorHtmlObj = {}
      }
    
      UniMap.api.getCatName=(slug) =>{
        const catName = UniMap.subCategoryRouterObject[slug] ? UniMap.subCategoryRouterObject[slug].name : slug;
        return catName
      }
    
    
      UniMap.api.showNotFoundOnSummaryTab=()=>{
        $(UniMap.ALL_ITEMS_DIV).html('<li style="color: #383838;background: #ffe1e1;padding: 1rem;margin-top: 1rem;"><i class="fa-solid fa-magnifying-glass-minus"></i> Nothing found, select another category or press <b style="cursor:pointer" class="show-all-places">Show All</b></li>');
      };
    
    
      UniMap.api.addAtrribution=(mapDiv)=>{
        var attribution = $(mapDiv+' .leaflet-control-attribution').html();
        $('.leaflet-control-attribution').html('')
        if(attribution){
          $('#attribution-text').html(attribution);
        }
      };
      
    
      UniMap.api.filterByCategory=(cat)=>{
        UniMap.categoryFilterTemp = $('#location-category-filter').val();
        var matchCategory = UniMap.categoryFilterTemp === cat;
        var anotherTab = $('[data-tab-link="tab-'+UniMap.ALL_ITEMS_TAB_ID+'"]').hasClass('active') ? false : true;
        var isNoFilter = UniMap.categoryFilterTemp ? false : true; 
      
        if(isNoFilter || anotherTab || matchCategory ){
          return true;
        } else {
          return false;
        }
      
      }
    
    
    
      UniMap.api.hideBrandTitle=(needHide)=>{ 
        var titleBrand = $(".container.brand-container");
        if(needHide){
          if(titleBrand.hasClass('ua-hide-title')) return true;
          titleBrand.addClass('ua-hide-title');
         
          
          return true;
        } else {
          if(titleBrand.hasClass('ua-hide-title')){
            titleBrand.removeClass('ua-hide-title');
          } 
          return false;
        }
      };
    
    
    
    
    
    
      UniMap.api.harmonizeSnippet=({text,lineslimit,maxchars})=>{
        var maxlines = lineslimit -1
        var bodyCommentFull = text.replace(/\n\s*\n/g, '\n').replace(/\r/g,'');
        var bodyComment =  bodyCommentFull.substring(0,maxchars)
        var lineSplitted = bodyComment.split('\n');
        var harmonizeText = ""
         if (maxlines > lineSplitted.length){
            return bodyComment;
        } else {
         for (var index = 0; index < maxlines; index++) {
            const p = lineSplitted[index];
            var last = index === maxlines-1;
            var suffix = (last) ?' ': '\n';
            harmonizeText += p.replace(/\n\s*\n/g, '').replace(/\r/g,'')  + suffix; 
          }
          return harmonizeText;
        }
      };
      UniMap.api.isMainPage=()=>{ return $('body').hasClass( UniMap.mapRoomClass ) };
      UniMap.api.isMapExist=()=>{ return  $("#uacamap").length > 0 && $("#uacamap").hasClass('leaflet-container') };
     
    
      UniMap.api.setButton=(cat,state)=>{
    
        const buttonClassList = 'btn btn-sm rounded-pill position-relative me-2'
        $('#ua-place-buttons li button').attr("aria-pressed","false").attr('class','btn-light '+buttonClassList)
        if(cat && state){
    
          let button = $('[data-cat-trigger="'+cat+'"]');
          let parentLi = button.closest('li'); 
          let index = parentLi.index();
          button.attr("aria-pressed","true").attr('class',state+' btn-primary '+buttonClassList)
          UniMap.swipers.horizontalButtons.slideTo(index)
        }
      }
    
    
      
      
      UniMap.api.hideBottomsAndBlockScroll=(hide)=>{
        if(hide){
           $('.bottombar').addClass('ua-bottom-bar-hide');
           $('main#panel').addClass('ua-hide-down');
           $('html').addClass('ua-noscroll');
         } 
         else {
           $('.bottombar').removeClass('ua-bottom-bar-hide');
           $('main#panel').removeClass('ua-hide-down');
           $('html').removeClass('ua-noscroll');
         }
       };
       UniMap.api.closestMarkerLatLng=()=>{
        var loc_string = localStorage.getItem("uamaplocation");
        if(loc_string){
          var [lat,lng] = JSON.parse(loc_string);
          if(UniMap.adminsUID) console.log(loc_string)
          return {_latlng:{lat:lat, lng:lng}} 
        }else{
          return null;
        }
      
      }
    
    
    
    
      UniMap.api.isPlaceVisibleOnMap = (map,latlng) => {
        const overlayDivHeight = document.getElementById("ua-sidepanel").offsetHeight;
        const mapHeight = document.getElementById("uacamap").offsetHeight;
        const overlayRatio = overlayDivHeight / mapHeight;
      
        let boundsEdges = map.getBounds();
        boundsEdges._southWest.lat += (boundsEdges._northEast.lat - boundsEdges._southWest.lat) * overlayRatio;
      
        const [lat, lng] = latlng;
        return Number(lat) < boundsEdges._northEast.lat &&
               Number(lat) > boundsEdges._southWest.lat &&
               Number(lng) > boundsEdges._southWest.lng &&
               Number(lng) < boundsEdges._northEast.lng;
      };
      
      UniMap.api.showToast=(title,body,meta)=>{
          $('#error-toast .toast-title').html(title);
          $('#error-toast .toast-body').html(body);
          $('#error-toast .toast-meta').html(meta);
          $('#error-toast').toast('show');
      }
      
    
      
    
      
    
      
      
      
      // TODO
      
      UniMap.api.guideHowCreatePlace=()=>{
         
        
        
        
        
      }
      
      
      
    
    
        return UniMap
    })