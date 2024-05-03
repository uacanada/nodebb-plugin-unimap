'use strict';
define('events/registerableListeneres',["core/variables" /*   Global object UniMap  */], function(UniMap) { 

const bottomPanelOffcanvasTriggers = ['hide','show']

class EventListeners {
	register = () => {
		$(document).on(this.hasPointerEventSupport(), this.touchHandler);
		$(document).on('click', this.clickHandler);
		$("#ua-mainframe").on( this.hasPointerEventSupport(), this.handleMainframeClick);
		this.toggleMapEvents(true);
		UniMap.hiddenControls.geocoder.on("markgeocode", this.handleMarkGeocode);
		
		

		function resizeend() {
			if (new Date() - UniMap.uaResizetime < UniMap.uaDelta) {
				UniMap.setTimeout(resizeend, UniMap.uaDelta);
			} else {
			  UniMap.uaResizetimeout = false;
			  UniMap.api.updateCSS();
			}
		  }
		
		  $(window).on('resize.unimap', function () {
			if (UniMap.map) {
			  UniMap.api.detectMapViewport();
			  UniMap.uaResizetime = new Date();
			  if (UniMap.uaResizetimeout === false) {
				UniMap.uaResizetimeout = true;
				setTimeout(resizeend, UniMap.uaDelta);
			  }
			}
		  });
		
		  $("body").on('classChange.unimap', (el, classes) => {
			if ($("body").hasClass(UniMap.mapRoomClass)) {
			  UniMap.api.detectMapViewport();
			}
		  });
		
		  $(document).on("change.unimap", "#eventSwitcher", function () {
			if ($(this).is(":checked")) {
			  $("#ua-form-event-holder").html(UniMap.uaEventPartFormHTML);
			} else {
			  $("#ua-form-event-holder").html("");
			}
		  });
		  $(document).on("change.unimap", 'input[name="socialtype"]', function () {
			UniMap.form.socialTypeIconAdjust()
		  });




		  $(document).on("change.unimap", "#ua-location-cover-img", function () {
			const files = $("input#ua-location-cover-img")[0].files;
			$("#ua-form-img-holder").empty(); 
		
			for (let i = 0; i < files.length; i++) {
				var fileReader = new FileReader();
				fileReader.onload = function (event) {
					var data = event.target.result;
		
					let initMainMark = i === 0 ? 'mainPlaceImg' : '';
				
					$("#ua-form-img-holder").append(
						'<div data-image-index="' + i + '" class="image-preview d-flex flex-column align-items-center m-2 ' + initMainMark + '"> <img class="set-image me-1" src="' + data + '"/> </div>'
					);
					
				};
				fileReader.readAsDataURL(files[i]);
			}
			$('#mainImage').val('0');
		});
		
		
		$(document).on('click', '.set-image', function() {
			$(".image-preview").removeClass('mainPlaceImg');
			const imageIndex = $(this).parent().data('image-index') || 0;
			$('.image-preview[data-image-index="' + imageIndex + '"]').addClass('mainPlaceImg');
			$('#mainImage').val(String(imageIndex));
		});
		
		
		  $(document).on("change.unimap", "#location-category-filter", function () {
			UniMap.api.setCategoryAndOpenCards($(this).val());
		  });
		  $(document).on("change.unimap", "#location-sort", function () {
			UniMap.api.setCategoryAndOpenCards($("#location-category-filter").val());
		  });
	
	
	
		
		  $('#sortPlacesOffcanvas').on('hide.bs.offcanvas', this.sortPlacesOffcanvasHide);
		  $('#sortPlacesOffcanvas').on('show.bs.offcanvas', this.sortPlacesOffcanvasShow);
		


		  $('#innerScrollPanel').on('scroll', this.bottomPanelScrollHandler);

		  UniMap.api.swipeZonesRegister()
                    
		 
		


	};

	remove = () => {


		try {
			$(document).off(this.hasPointerEventSupport(), this.touchHandler);
		$(document).off('click', this.clickHandler);
		$("#ua-mainframe").off( this.hasPointerEventSupport(), this.handleMainframeClick );
		
		
		
		$('#sortPlacesOffcanvas').off('hide.bs.offcanvas', this.sortPlacesOffcanvasHide);
		$('#sortPlacesOffcanvas').off('show.bs.offcanvas', this.sortPlacesOffcanvasShow);

		this.toggleMapEvents(false);
		UniMap.hiddenControls.geocoder.off("markgeocode", this.handleMarkGeocode);

		this.removeAllWithUnimapNamespace('unimap')

		for (const key in UniMap.swipers) {
			if (UniMap.swipers[key] instanceof UniMap.Swiper) {
				try {
					UniMap.swipers[key].destroy(true, true);
				} catch (error) {
					// UniMap.console.log(error);
				}
			 
			}
		}
		} catch (error) {
			UniMap.console.log(error)
		}
		$('#scrollableBottomPanel').off('scroll',this.bottomPanelScrollHandler);
		UniMap.api.swipeZonesUnregister()
  
  
	};


	removeAllWithUnimapNamespace = (nameSpace) => {
		// Select all elements, including window and document
		const allElements = $('*, window, document');
		allElements.each(function() {
		  const elem = $(this);
		  const events = $._data(this, "events");
		  if (!events) return;
		  for (const eventType in events) {
			const handlers = events[eventType];
			handlers.forEach(function(handlerObj) {
			
			  if(handlerObj?.namespace){
				try {
				  if (handlerObj.namespace.indexOf(nameSpace) !== -1 || eventType?.indexOf(nameSpace) !== -1) {
					const trigger = `${eventType}.${handlerObj.namespace}`;
					elem.off(trigger);
				  } 
				} catch (error) {
					UniMap.console.log(error);
				}
			  }
			});
		  }
		});
	  }
	  

	  reload = () => {
		this.remove();
		this.register();
	};


	sortPlacesOffcanvasHide(){
		$('#ua-horizontal-buttons-wrapper').removeClass('movedown')
	}
	sortPlacesOffcanvasShow(){
		$('#ua-horizontal-buttons-wrapper').addClass('movedown').removeClass('hidden')
	}

	

zoomendHandler() {
	const level = UniMap.map.getZoom();
	UniMap.api.setClassWithFarawayZoom(level);
  }
  
  enterFullscreenHandler() {
	
	UniMap.isFullscreenMode = true;
  }
  
  exitFullscreenHandler() {
	
	UniMap.isFullscreenMode = false;
  }
  
  contextmenuHandler(e) {
	
	const L = UniMap.L
	if (UniMap.currentmarker) {
		UniMap.map.removeLayer(UniMap.currentmarker);
	}
	
	UniMap.currentmarker = L.marker(e.latlng, { icon:L.divIcon({
		className: "ua-pin-icon",
		html: '<div class="position-relative"><span class="ua-bounce-animated-pin">📍</span></div>',
		iconSize: [25, 25],
		iconAnchor: [15, 30],
		popupAnchor: [5, -5],
	  }) }).addTo(UniMap.map);
  }
  
  movestartHandler() {
	try {
		UniMap.moveIterations = 1;
	} catch (error) {
		UniMap.console.log(error)
	}
	
  }
  
  moveHandler() {
	
	UniMap.moveIterations++;
	if (UniMap.moveIterations > 21) {
		UniMap.api.hideElements(true)
	 // UniMap.api.expandMap();
	}
  }
  
  moveendHandler() {
	UniMap.moveIterations++;
	UniMap.api.hideElements(false)
  
	if(UniMap.api.locationSelection.isVisible){
		UniMap.api.locationSelection.showLatLng()
	}
   
  }
  
  handleMarkGeocode(e) {
	if(UniMap.isMapBoxKeyExist){
		let { lat, lng } = e.geocode.center;
		let loc = { latlng: { lat, lng } };
		UniMap.api.createMarkerAtLocation(loc, e.geocode);
	} else {
		UniMap.console.log(handleMarkGeocode,e)
	}
  }


	hasPointerEventSupport = () => {
		if (window.PointerEvent && "maxTouchPoints" in navigator) {
			return "pointerup.unimap";
		} else {
			return "click.unimap";
		}
	};

	handleMainframeClick = (e) => {
		UniMap.api.expandMap(`mainframe on click`);
		$("#ua-mainframe").off(
			this.hasPointerEventSupport(),
			this.handleMainframeClick
		);
	};


	bottomPanelScrollHandler = utils.debounce(() => {
		const $panel = $('#innerScrollPanel');
		const currentScrollTop = $panel.scrollTop();
	
		if (currentScrollTop < 5) {
		  UniMap.console.log(`Force scrollableBottomPanel.close() cause:  scrollTop:`.currentScrollTop)
		  UniMap.api.scrollableBottomPanel.close();
		  UniMap.previousScrollHeight = 0;
		  return;
		}
	
		const isScrollingDown = UniMap.previousScrollHeight < currentScrollTop - 10;
		const isWithinViewHeight = currentScrollTop < Math.floor(window.innerHeight / 2);
	
		if (currentScrollTop > UniMap.PANEL_SCROLL_HEIGHT && isScrollingDown && isWithinViewHeight) {
		  const updatedScrollHeight = Math.floor(window.innerHeight * 0.7);
		  $panel.animate({ scrollTop: updatedScrollHeight }, 300, 'swing');
		  UniMap.previousScrollHeight = updatedScrollHeight;
		} else {
			UniMap.previousScrollHeight = currentScrollTop;
		}
	  }, 100);
	

	clickHandler = (e) => {
		// Use the 'click' event to prevent inadvertent triggers when using 'pointerup' event
		const target = $(e.target);
		
	  
		const findEl = (selector) => {
		  const realTarget = target.closest(selector);
		  if (realTarget.length) {
			e.preventDefault();
			return realTarget;
		  }
		  return false;
		};
	  
		const actions = {
		  '.edit-place': 				() => UniMap.form.editPlace(findEl("a.edit-place").attr("data-topic")),
		  '.place-with-coordinates': 	() => UniMap.api.openCards(findEl(".place-with-coordinates").attr("data-marker-id"), "distance", false),
		  '.newLocationCreateButton': 	() => UniMap.api.locationSelection.addPlace(),
		  '.newLocationCancelButton': 	() => UniMap.api.locationSelection.cleanMarker(),
		  '.newLocationOpenMarker': 	() => UniMap.api.locationSelection.addMarker(),
		  '.showBottomPanel':			() => UniMap.api.scrollableBottomPanel.open(findEl('[data-ua-content-id]')),
		  '.sheet-spacer':		        () => UniMap.api.scrollableBottomPanel.close(), 
		  '.minus-close-button':		() => UniMap.api.scrollableBottomPanel.close()
		};
	  
		for (const selector in actions) {
		  if (findEl(selector)) {
			actions[selector]();
			return;
		  }
		}
	  };
	  

	touchHandler = (e) => {
		const target = $(e.target);
		const findEl = (selector) => {
			const realTarget = target.closest(selector);
			if (realTarget.length) {
			  e.preventDefault();
			  return realTarget;
			}
			return false;
		  };
	  
		const actions = {
		  '#leave-as-loc': 			() => $("#ua-form-event-holder").html(""),
		  '#ua-conv-to-event': 		() => $("#ua-form-event-holder").html(UniMap.uaEventPartFormHTML),
		  '.try-locate-me': 		() => UniMap.api.tryLocate({ fornewplace: false }),
		  '#ua-locate-me': 			() => UniMap.api.addNewPlace(),
		  '#cardsDown': 			() => UniMap.api.rotateCards('horizontal'),
		  '.ua-reload-link': 		() => UniMap.api.reloadMainPage(),
		  '.rotateCards': 			() => UniMap.api.rotateCards(),
		  '.ua-sort': 				() => {
			const sortBy = findEl('a.ua-sort').attr('data-ua-sortby');
			if (sortBy) {
			  UniMap.api.openCards(0, sortBy, false);
			  $('#sortby-label').text(sortBy);
			}
		  },
		  '.removeCards': 			() => {
			e.preventDefault();
			UniMap.api.removeCards();
			UniMap.api.contextButtonText({
			  text: 'Reset filters...',
			  delay: 800,
			  to: UniMap.contextButton.router.main
			});
		  }
		};
	  
		for (const selector in actions) {
		  if (findEl(selector)) {
			actions[selector]();
			return;
		  }
		}
	  };

	toggleMapEvents = (enable = true) => {
		
		const eventList = [
		  "zoomend",
		  "enterFullscreen",
		  "exitFullscreen",
		  "contextmenu",
		  "movestart",
		  "move",
		  "moveend"
		];
	  
		eventList.forEach((event) => {
		try {

			
			const handler = this[event+'Handler'];
    		
		
			if (enable) {
				UniMap.map.on(event,handler);
			  } else {
				UniMap.map.off(event,handler);
			  }
		} catch (error) {
			UniMap.console.log(error)
		}
		
		});
	  }
	  
	 

	  
	  
}
  
  
  return EventListeners;

})