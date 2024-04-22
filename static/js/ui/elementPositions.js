'use strict';
define('ui/elementPositions', ["core/variables" /*   Global object UniMap  */], function(UniMap) { 
	
	UniMap.api.setContextCss=(css)=>{
		if($('#context-styles')[0]){
		  $('#context-styles').text(css||'');
		  }else{
		  $('head').append('<style id="context-styles" type="text/css">'+css||''+'</style>');
		 }
	  }
	
	UniMap.api.shakeElements=(elems,animationClass)=>{
		for (const elem of elems) {
			$(elem).removeClass(animationClass);  
			UniMap.setTimeout(() => { $(elem).addClass(animationClass) }, 10)
		}
	}
    
	UniMap.api.updateCSS = () => {
		const {
		
			rightNav,
			leftNav,
			
		} = UniMap.api.getDivSizes();
		
		const bodyWithMap = "body." + UniMap.mapRoomClass;
		
		
	
		const styles = ` #uacamap-wrapper {
			  	padding-right: ${rightNav}px !important;
				padding-left: ${leftNav}px !important;
			 }

				@media screen and (min-width: 1899px) and (min-height: 1000px) {
					html.ua-noscroll ${bodyWithMap} {
					overflow-y: inherit !important;
					}
				}`;

				
				

		if ($("#manipulativestyle")[0]) {
			$("#manipulativestyle").text(styles);
		} else {
			$("head").append(
				'<style id="manipulativestyle" type="text/css">' + styles + "</style>"
			);
		}

		if (UniMap.map && UniMap.map.invalidateSize) {
			UniMap.setTimeout(() => {
				if(!UniMap.map)return
				UniMap.map.invalidateSize();
				UniMap.api.fitElementsPosition();
			}, 120);
		}
	};


    UniMap.api.getDivSizes=()=>{
        var screenH = $(window).innerHeight();
        var screenW = $(window).innerWidth();
        var rightNav = $('nav.sidebar.sidebar-right').outerWidth();
        var leftNav = $('nav.sidebar.sidebar-left').outerWidth();
        var navRealH = $( '.bottombar-nav' ).outerHeight() || 0;
        var bottomButtonsH = $('#ua-horizontal-buttons-wrapper').outerHeight() || 0;
		var contextButton = $('#ua-context-buttons-wrapper').outerHeight() || 0;
        var placeCardH = $(UniMap.placeCardDiv).outerHeight() || 0; 
		var visibleMap = $('#uacamap').outerHeight() || 0;
     	var bottomElementsH =  Math.floor(navRealH+placeCardH);
        var mapHalf = Math.floor(visibleMap / 2);
        var visibleMapWhenCards = Math.floor(visibleMap - placeCardH - bottomButtonsH);
        var onePercentH = Math.floor(screenH / 100);
        var markerOffset = (visibleMapWhenCards < mapHalf) ? Math.floor(mapHalf-visibleMapWhenCards) : 0;
        var isDesktop = (screenW > 800 || screenW > screenH)? true : false;
        var cardStackSize = Math.floor((screenW - rightNav - leftNav)/500);
        window.UNIMAP_cachedElementSizes = {screenH,screenW,bottomButtonsH,navRealH,rightNav,leftNav,placeCardH,bottomElementsH,visibleMap,mapHalf,markerOffset,onePercentH,isDesktop,cardStackSize,contextButton}
        return  window.UNIMAP_cachedElementSizes;
      };

    UniMap.api.toggleFs=(force)=>{ if (UniMap.isFullscreenMode || force) UniMap.map.toggleFullscreen()}


    UniMap.api.fitElementsPosition = (latlng) => {
		
		UniMap.setTimeout(() => {
			
			const { screenW, placeCardH, onePercentH} = UniMap.api.getDivSizes();
			let zoomControlsPosition = { bottom: `4rem`};
           	if($(UniMap.placeCardDiv).hasClass('verticalCards') && screenW>700){

			} else {
				zoomControlsPosition = {  bottom: `${Math.floor(placeCardH)}px`};
			}
			$(".leaflet-bottom").css(zoomControlsPosition);
			if (latlng) {
				const markerOffset = placeCardH > Math.floor(onePercentH * 50) ? Math.floor(onePercentH * 30) : -50
				UniMap.api.moveMarkerToTop(latlng, markerOffset);
			}
			UniMap.api.detectMapViewport();
			UniMap.map.invalidateSize();
		}, 150);
	};



     


})