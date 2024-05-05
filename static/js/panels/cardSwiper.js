 'use strict';
  define('panels/cardSwiper', ["core/variables" /*   Global object UniMap  */], function(UniMap) { 
      const {Swiper} = UniMap
    
  UniMap.api.animateCards = async (state) => {
     if(state==='open'){
       UniMap.api.rotateCards(UniMap.swipers.cardsCarousel.params.direction)
      $(UniMap.placeCardDiv).removeClass('slider-closed').addClass('slider-opened')
     } else{
      $(UniMap.placeCardDiv).removeClass('slider-opened').addClass('slider-closed')
     }
    }
  
    
  
  
  
    UniMap.api.cleanMarkers = (forced) => {
      UniMap.api.setContextCss()
     // $('.ua-marker-d').removeClass('ua-opened-marker');
      if(UniMap.pointerMarker) {
        //UniMap.pointerMarker.off();
        UniMap.map.removeLayer(UniMap.pointerMarker);
        UniMap.pointerMarker = null
      }
     
      if(UniMap.lastPlaceMarker){
        UniMap.lastPlaceMarker.closePopup()
        //removeClassFromMarkerIcon(UniMap.lastPlaceMarker, 'ua-opened-marker');
      }
  
      if(forced) {
        UniMap.api.cardsOpened(false)
      }
    
    }
  
  UniMap.api.pointerMarker = (tid,place) => {
     const {L} = UniMap
      UniMap.api.cleanMarkers()
      if(!tid || !place.gps) return false  
      tid = Number(tid)
      const markerImg = UniMap.api.getProfileImage(place.json)
      const pointerMarkerIcon = L.divIcon({className: 'pointer-marker', html: `<div class="pointer-marker-icon rounded-circle" style="background: url(${markerImg}) center center / cover no-repeat white; animation:ua-shake-element 400ms ease-in-out both"></div>`, iconSize: [64, 64], iconAnchor: [32, 48],  popupAnchor:  [1, -50]});
      UniMap.pointerMarker = L.marker(place.gps, {icon: pointerMarkerIcon});
      UniMap.pointerMarker.bindPopup(place.marker._popup._content);
      UniMap.pointerMarker.setZIndexOffset(88888);
     
      UniMap.pointerMarker.on('click', (e)=> {    
        try {
          const slide = $('div[data-slide-tid="'+tid+'"]')
          const slideId = slide.attr('data-slide-index')
          UniMap.swipers.cardsCarousel.slideTo(Number(slideId)) 
          // UniMap.map.setView(place.gps,map.getZoom()+1); 
          UniMap.api.openPlaceModal(tid)  
          UniMap.pointerMarker.openPopup(); 
        } catch (error) {
          
        }
      });
      
       
       let openedMarkerCss = place.neighborsCount ?`.ua-topic-${Number(tid)} { font-weight: bold; opacity: 1!important;}` : `.ua-topic-${Number(tid)} {opacity:0!important}`
           openedMarkerCss+=` div[data-slide-tid="${Number(tid)}"] .ua-topic-link .place-pic { width: 4rem!important} div[data-slide-tid="${Number(tid)}"] .card-title{ font-weight: bold;} div[data-slide-tid="${Number(tid)}"] .ua-place-card-inner {0px 6px 8px 0px rgba(0, 0, 0, 0.5)}`
           UniMap.api.setContextCss(openedMarkerCss)
           UniMap.api.cardsOpened(true)
          
       //   addClassToMarkerIcon(place.marker, 'ua-opened-marker');
        //  if(place.neighborsCount) addClassToMarkerIcon(place.marker,"has-neighbors");
          UniMap.api.fitElementsPosition(place.gps)
          UniMap.pointerMarker.addTo(UniMap.map).openPopup()
          //$('.ua-topic-'+tid).addClass('ua-opened-marker');
         
         // UniMap.api.setContextCss('.ua-marker-default.ua-topic-'+Number(tid)+'{opacity:0!important}')
          //UniMap.api.setContextCss('.ua-marker-default{max-width:5rem!important;}')
           // $(place.marker._icon).addClass("ua-opened-marker");
          
          // if(place.marker.__parent?.spiderfy){
          //   //place.marker.__parent.spiderfy()
          // }
     
  }
  
  
  UniMap.api.openMarker=(tid)=>{
    if(!tid)return
    const {map} = UniMap
      const place = UniMap.allPlaces[Number(tid)];
      if(place && place.marker){
        UniMap.previousTid=Number(tid)
        const isVisibleEl = UniMap.allPlaces[Number(tid)].marker.getElement()
        const currentZoom = map.getZoom()
        UniMap.lastPlaceMarker = place.marker;
        const zoom_level = isVisibleEl && currentZoom > 13  ? map.getZoom() : 16;
        const latlng = place.gps
        map.setView(latlng, zoom_level);
        UniMap.api.pointerMarker(Number(tid),place)
      }
  };
  
  
  
  UniMap.api.openCarousel = async (places, autoplay) =>{
      const {L} = UniMap
      UniMap.api.animateCards('closed')
      const card = $(UniMap.placeCardDiv);
      const cat = $('#location-category-filter').val();
      const { isDesktop } = UniMap.api.getDivSizes();
      const onlyOneItem = places.length <= 1;
      let html = `<button id="cardsDown" aria-hidden="true"><i class="fa-solid fa-angle-down"></i></button> <div id="ua-cards-slider" class="swiper px-1 pt-2 desktop-${isDesktop}${onlyOneItem ? ' only-one-item pe-1' : ' ps-2'}"> <div class="swiper-wrapper">`;
    
      places.forEach((placedata, index) => {
        html += `<div data-slide-index="${index}" data-slide-tid="${placedata.tid}" class="swiper-slide${onlyOneItem ? ' px-1' : ' me-2'}">${placedata.html}</div>`;
      });
  
      const slideTreshold = $(window).innerWidth() > 480 ? Math.floor($(window).innerWidth() / 650) + 1 : 1;
       if (places.length > slideTreshold && cat) {
       html += `<div class="swiper-slide me-3">
                <ul id="last-incat-slide" class="bg-primary p-2 shadow rounded list-group list-group-flush">
                    <li class="list-group-item">
                        <i class="fas fa-info-circle"></i> 
                        End of the line for <span class="badge text-bg-light rounded-pill">${UniMap.api.getCatName(cat)}</span> places
                    </li>
                    <li class="list-group-item">
                        <i class="fas fa-plus-circle"></i> 
                        Fancy adding a spot?
                    </li>
                    <li class="list-group-item show-all-places">
                        <i class="fas fa-globe-americas"></i> 
                        Clear filters & Explore all places
                    </li>
                    
                </ul>
            </div>`;
      }
    
      if (places.length > slideTreshold) {
       html += '<div class="swiper-slide me-3"><div id="last-slide" class="p-2 ua-blue-gradient shadow rounded"><div class="dynamictext p-0">Find more</div>In our blogs</div></div>';
      }
  
      try {
        const ads = cat ? UniMap.api.findMatchedAdv(cat,places[0].json.placetags) : places.length > slideTreshold ? ajaxify.data.UniMapSettings.advMarkers:[]
        for (const ad of ads) {
          html += `<div class="swiper-slide${onlyOneItem ? ' p-2' : ' me-3'}" data-adv-id="${ad.id}" data-latlng-target="${ad.latlng}"><div class="ua-place-card-inner ms-0 me-0 p-3 position-relative">${ad.card}</div></div>`;
        }
      } catch (error) {
        UniMap.console.log(error)
      }
        
  
  
      html += '</div></div>'
      places.length
  
      //UniMap.api.contextButtonText({text:'Open '+places.length+' places... '+UniMap.api.getCatName(cat),delay:1300,to:UniMap.contextButton.router.cards})
  
  
      await sleep(33);
      card.html(html);
      UniMap.api.openPlacesSwiper(places,autoplay);
      UniMap.api.hideElements(true)
      await sleep(33);
      UniMap.api.animateCards("open");
      var cardDivId = L.DomUtil.get(UniMap.placeCardDiv.replace("#", ""));
      L.DomEvent.disableScrollPropagation(cardDivId);
      L.DomEvent.disableClickPropagation(cardDivId);
      
  
      
  }
  
  UniMap.api.openPlaceModal = async (tid) => {
        UniMap.api.shakeElements(['#cardsSwiperPlaceholder'],'ua-shake-vert')
  
        if(!tid){
          tid = Number($('.swiper-slide-active .ua-place-card-inner').attr('data-ua-tid'))
        }


       
        

        const p = UniMap.allPlaces[tid].json
        const fa_icon = UniMap.allPlaces[tid].marker?.icon
        const placeModal = document.getElementById('ua-place-modal')
        const modalTitle = placeModal.querySelector('#modal-place-title')
        const modalBodyInput = placeModal.querySelector('#placeLoader')



        function setTitle(el){
          

          const author = {
              color: el.data('authorcolor'),
              avatar: el.data('authoravatar'),
              name: el.data('authorname'),
              letter: el.data('authorletter')
          };

         
          const avatarImage = `<img alt="${author.name} Avatar" title="${author.name}" data-uid="${p.uid}" class="p-0 m-0 avatar avatar-rounded me-2" component="user/picture" src="${author.avatar}" style="--avatar-size: 2rem; border-radius: 50%; width: 2rem; height: 2rem;" onerror="this.remove();" itemprop="image"></img>`;
          const avatarDiv = `<div class="me-2 avatar avatar-tooltip not-responsive avatar-rounded d-flex  align-items-center justify-content-center" component="avatar/picture" style="width:2rem; height:2rem; background-color:${author.color};" aria-label="${author.name}" data-bs-original-title="${author.name}"><b>${author.name[0]}</b></div>`
            
          const avatar = author.avatar ? avatarImage : avatarDiv;

          modalTitle.innerHTML = `<div class="d-flex" style="line-height: 2rem;color:${author.color};text-transform: none;">${avatar}${author.name}</div>`;
        }

        const img = UniMap.api.getProfileImage(p)


        async function getTopicData(tid) {
          try {
              const topicFromApi = await fetch(`/api/topic/${tid}/1/1`);
              const topic = await topicFromApi.json();
              if(!topic || !topic.posts[0]) return {error:'Topic is empty: '+tid}
              
              return topic;
          } catch (error) {
            UniMap.console.log(error);
            return {error:`Fail fetch tid: ${tid}`}
          }
        }

        function generateAvatar(comment) {
          const name = comment.user.displayname || comment.user.fullname || comment.user.username || '?'
          return comment.user.picture ?
              `<img alt="${comment.user.fullname}" title="${comment.user.fullname}" class="avatar avatar-tooltip not-responsive avatar-rounded" component="avatar/picture" src="${comment.user.picture}" style="width:3rem" onerror="this.remove();" itemprop="image">` :
              `<div class="avatar avatar-tooltip not-responsive avatar-rounded" component="avatar/picture" style="width:3rem; height:3rem; display: flex; align-items: center; justify-content: center; background-color:${comment.user["icon:bgColor"]};" aria-label="${name}" data-bs-original-title="${name}">
              ${String(name)[0]}
              </div> `;       
        }

        function generateFirstPost(comment) {
          const avatar = generateAvatar(comment);
          return `<div class="comment-block">
          <div class="comment-content d-flex align-items-start">
              <div class="flex-grow-1">
                  ${comment.content}
              </div>
          </div>
          
      </div>`;
        }

        function generateRemainingPosts(posts) {
          if(!posts[0]) return '';
          let comments = `<ul id="recent_posts" class="mt-5 list-group" data-numposts="${posts.length}">`;
      
          posts.forEach((comment) => {
              const avatar = generateAvatar(comment);
      
              comments += `
              <li class="list-group-item d-flex align-items-start" data-pid="${comment.pid}">
              <a class="flex-shrink-0 me-3" href="/user/${comment.user.userslug}">
                  ${avatar}
              </a>
              <div class="flex-grow-1">
                  ${comment.content}
                  <a class="float-end" href="/post/${comment.pid}">
                      <i class="fa-regular fa-comment-dots"></i>
                  </a>
              </div>
             </li>
          
              `;
          });
      
          comments += `</ul>`;
          return comments;
      }

      async function renderComments(tid) {
        const topic = await getTopicData(tid);
    
        if (topic.error){
          UniMap.console.log(topic);
          return;
        }
    
        const firstPost = generateFirstPost(topic.posts[0]);
        const remainingPosts = generateRemainingPosts(topic.posts.slice(1));
    
        $("#place-modal-comments").html(firstPost + remainingPosts);
        setTitle($(firstPost).find('#metaTab'))
        
       
      }

      try {
        const markerOffset = Math.floor($(window).innerHeight() / 2) - 100
				UniMap.api.moveMarkerToTop(p.latlng, markerOffset);
       } catch (error) {
        UniMap.console.log(error)
       }
      
      const eventCategoryBadge = p.eventCategory ? `<span class="badge text-bg-primary rounded-pill me-1">${(p.eventCategory) ? (p.eventCategoryName && p.eventCategoryName !== 'undefined') ? p.eventCategoryName : p.eventCategory : '' }</span>`:''
      const placeCategoryBadge = `<span class="badge text-bg-primary rounded-pill">${(p.categoryName && p.categoryName !== 'undefined') ? p.categoryName : p.placeCategory}</span>`
      modalBodyInput.innerHTML = `<div class="d-flex mb-5 w-100 align-items-start">
        <div class="me-auto">
        <h5 class="mb-1">${fa_icon} ${p.placeTitle}</h5>
          ${eventCategoryBadge+placeCategoryBadge}
          </div>
          <img src="${img}" alt="Profile Picture" class="ratio ratio-1x1 rounded-circle align-self-start" style="height: auto; width: auto; max-height: 4rem;"/>
        </div><div id="place-modal-comments"><div class="spinner-grow spinner-grow-sm" role="status"><span class="visually-hidden">Loading...</span></div></div>`


        $("#ua-place-modal").offcanvas("show");

        await renderComments(tid)
        initializeOrUpdatePlaceModalSwiper()
        
  
  
  }
  
  
  
  UniMap.api.openPlacesSwiper = (places, autoplay) => {
    // Determine the direction of the swiper based on screen width and number of places
    // If there are more than 6 places and screen width is more than 1000px, set vertical, else horizontal
    let directionOnWideScreen = places?.length > 6 && window.innerWidth > 1000 ? "vertical" : "horizontal";

    // Use the existing direction from swipers.cardsCarousel.params, if available, else use directionOnWideScreen
    let direction = UniMap.swipers.cardsCarousel?.params?.direction || directionOnWideScreen;

    // Configuration for free mode of swiper
    let freeMode = {
        enabled: true,
        sticky: true,
    };

    // Initialize the Swiper with the determined direction and other configurations
    UniMap.swipers.cardsCarousel = new Swiper('#ua-cards-slider', {
        direction,
        freeMode,
        slidesPerView: 'auto',
        mousewheel: { invert: false, sensitivity: 0.25, eventsTarget: '#ua-cards-slider' },
        autoplay: autoplay ? { delay: 4200, disableOnInteraction: false } : false,
    }).on('slideChangeTransitionEnd', (e) => handleSlideChange(e, places, UniMap))
      .on('click', (J, event) => handleClick(J, event, UniMap));
};

  
  
  
  UniMap.api.closestMarkerAddress=()=>{
      var loc_string = localStorage.getItem("uamaplocation");
      if(loc_string){
        var [lat,lng] = JSON.parse(loc_string);
        var nearest_markers = UniMap.api.sortMarkers( {_latlng:{lat:lat, lng:lng}}, 'distance' );
        var near = nearest_markers[0].json;
        return near.placeTitle+', '+near.city;
        
      }else{
        return '';
      }
    
    }
  
  
    UniMap.api.nearestByDistance = (firstMarker, locations) => {
      const tid = firstMarker.tid;
      const distanceTo = { lat: firstMarker._latlng.lat, lng: firstMarker._latlng.lng };
    
      // define local constants for frequently used functions
      const asin = Math.asin;
      const cos = Math.cos;
      const sin = Math.sin;
      const PI_180 = Math.PI / 180;
    
      function hav(x) {
        const s = sin(x / 2);
        return s * s;
      }
    
      function relativeHaversineDistance(lat1, lon1, lat2, lon2) {
        const aLatRad = lat1 * PI_180;
        const bLatRad = lat2 * PI_180;
        const aLngRad = lon1 * PI_180;
        const bLngRad = lon2 * PI_180;
        const ht =
          hav(bLatRad - aLatRad) + cos(aLatRad) * cos(bLatRad) * hav(bLngRad - aLngRad);
        // since we're only interested in relative differences,
        // there is no need to multiply by earth radius or to sqrt the squared differences
        return asin(ht);
      }
    
      let sorted = locations.sort((a, b) => {
        const distanceA = relativeHaversineDistance(a.lat, a.lng, distanceTo.lat, distanceTo.lng);
        const distanceB = relativeHaversineDistance(b.lat, b.lng, distanceTo.lat, distanceTo.lng);
    
        if (a.tid === tid) {
          return -1; // tid first
        } else if (b.tid === tid) {
          return 1; 
        } else {
          return distanceA - distanceB; 
        }
      });
    
      return sorted;
  };
    
  
  
  
    UniMap.api.sortMarkers = (firstMarker,sort_by,markers) => {
      const allMarkers = (markers) ? markers : UniMap.currentSortedMarkers;
      const s = sort_by ? sort_by : $('#location-sort').val()
  
      if(!firstMarker){
        const markerInMemory = UniMap.api.closestMarkerLatLng()
        firstMarker = (markerInMemory) ? markerInMemory : {_latlng:{lat:allMarkers[0].lat, lng:allMarkers[0].lng}}
      }
      
      if(s==='distance') {
        return UniMap.api.nearestByDistance(firstMarker, allMarkers)
      } else if(s==='latest'){
        return allMarkers.sort((a, b) => b.json.created - a.json.created);
      } else if(s==='oldest'){
        return allMarkers.sort((a, b) => a.json.created - b.json.created);
      } else if(s==='category'){ 
        // TODO : fix logic when spiderfy
        // actually only same category in same city
        var sameCatSameCity = [];
        var otherMarkers = [];
    
        for (const markerDist of allMarkers) {
          if(markerDist && firstMarker?.tid && markerDist.json.placeCategory === UniMap.allPlaces[firstMarker.tid]?.json.placeCategory && markerDist.json.city === UniMap.allPlaces[firstMarker.tid].json.city){
            sameCatSameCity.push(markerDist)
          } else {
            otherMarkers.push(markerDist)
          }
        }
    
        return [...sameCatSameCity, ...otherMarkers];
    
      } else if(s==='event'){
        return allMarkers.sort((a, b) => {
          var sort_criteriaA = (a.json.eventStartDate) ? Math.floor(Date.parse(a.json.eventStartDate+' '+(a.json.eventStartTime||''))/1000)+1e5 : a.json.created;
          var sort_criteriaB = (b.json.eventStartDate) ? Math.floor(Date.parse(b.json.eventStartDate+' '+(b.json.eventStartTime||''))/1000)+1e5 : b.json.created;
  
          return sort_criteriaB-sort_criteriaA;
        
        });
      }else{
       return allMarkers;
      }
  }
  
  
  
  UniMap.api.openCards = async (topic_id,sort_by,autoplay) => {

    UniMap.api.scrollableBottomPanel.close()

       if($('body').hasClass('addPlaceMode')){
        return  UniMap.api.shakeElements([".newLocationCancelButton"],'ua-shake-vert');
       } 


      let tid = Number(topic_id)
      let thisMarker=null
      let markersTemp=null
      let s = sort_by ? sort_by : $('#location-sort').val();
  
      if(tid > 0){
        UniMap.api.openMarker(tid)

        thisMarker = UniMap.allPlaces[tid].marker
        if(!thisMarker) return console.log(`no marker ${tid}`)
        markersTemp = UniMap.api.sortMarkers(thisMarker,'distance',null); // If open cards for certain marker - sort others only by distance
        if(s==='category') markersTemp = UniMap.api.sortMarkers(thisMarker,'category',markersTemp)
        if( $('#location-sort').val()!=='distance'); $('#location-sort').val('distance');
      } else {
        markersTemp = UniMap.api.sortMarkers(null,s,null)
        tid = Number(markersTemp[0].tid);
        UniMap.api.openMarker(tid)
        thisMarker = UniMap.allPlaces[tid].marker;
      }
      // UniMap.console.log('DEBUG :: ',{ activecard:$('#ua-cards-slider li.is-active .ua-place-card-inner').attr('data-ua-tid'),topic_id,tid,s,sort_by},Number(topic_id)>0,markersTemp.length)
    
      UniMap.api.openCarousel(markersTemp,autoplay)
      UniMap.currentSortedMarkers = markersTemp 
      await UniMap.api.animateScroll()
      UniMap.api.fitElementsPosition()             
  };
  
  
  
  
  UniMap.api.removeCards = async () => { 
      UniMap.api.contextButtonText({text:'',delay:100,to:UniMap.contextButton.router.main})
      UniMap.api.rotateCards('horizontal');
      UniMap.api.animateCards('close')
      UniMap.api.scrollableBottomPanel.close()
      UniMap.api.hideElements(false)
      UniMap.api.cleanMarkers(true)
      UniMap.api.animateScroll()
      UniMap.api.cardsOpened(false)

      
      UniMap.setTimeout(() => {
        UniMap.api.fitElementsPosition();
        UniMap.api.setCategory('');
        UniMap.api.filterMarkers(false)
        
        $(UniMap.placeCardDiv).html('')
      }, 200);
      
      
  };
  
  UniMap.api.cardsOpened=(y)=>{
      
    const b = $('body')
    const c = 'cards-opened'
    if(y && !b.hasClass(c))  b.addClass(c);
    if(!y && b.hasClass(c))  b.removeClass(c);
  
    // UniMap.swipers.contextButton.slideTo(1)
   // if($(window).innerWidth()<500){}
  }
  
  
  UniMap.api.rotateCards = (direction) => { 
   
    if(!UniMap.swipers.cardsCarousel?.changeDirection || UniMap.swipers.cardsCarousel.destroyed) return
  
    const crds = $('#cardsSwiperPlaceholder')
   
   
  
    if(direction){
      UniMap.swipers.cardsCarousel.changeDirection(direction)
      if(direction==='vertical') crds.addClass('verticalCards')
      else crds.removeClass('verticalCards')
    
    } else{
      if(crds.hasClass('verticalCards')){
        crds.removeClass('verticalCards')
        UniMap.swipers.cardsCarousel.changeDirection('horizontal')
      
    
      }else{
        crds.addClass('verticalCards')
        UniMap.swipers.cardsCarousel.changeDirection('vertical')
      
      }
    }
    
    UniMap.setTimeout(() => {
      UniMap.swipers.cardsCarousel.update()
    }, 1000);
    UniMap.api.fitElementsPosition()
  
    
  
  
  
  }
  

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  function addClassToMarkerIcon(marker, className) {
    $('.leaflet-marker-icon').removeClass(className)
    if(!marker)return false
    const icon = marker.getIcon();
    const classNames = icon.options.className.split(' ');
  
    // Check if the class already exists
    if (!classNames.includes(className)) {
      classNames.push(className);
      icon.options.className = classNames.join(' ');
  
      // Update the marker's icon with the modified icon object
      marker.setIcon(icon);
    }
  }
  
  function removeClassFromMarkerIcon(marker, className) {
   if(!marker)return false
    
    const icon = marker.getIcon();
    const classNames = icon.options.className.split(' ');
  
    // Find the index of the class
    const index = classNames.indexOf(className);
  
    // If the class exists, remove it
    if (index !== -1) {
      classNames.splice(index, 1);
      icon.options.className = classNames.join(' ');
  
      // Update the marker's icon with the modified icon object
      marker.setIcon(icon);
    }
  }
  
  
  function handleClick(J, event, UniMap) {
    const slide = $(J.clickedSlide)
    const tid = Number(slide.find('.ua-place-card-inner').attr('data-ua-tid'));
    const advId =  slide.attr('data-adv-id')
    const sameTarget = UniMap.previousTid === tid

    const isCloseButton = $(event.target).hasClass('removeCards') || $(event.target.parentElement).hasClass('removeCards')
    const isEditButton = $(event.target).hasClass('edit-place') || $(event.target.parentElement).hasClass('ua-edit-link')
    if(isCloseButton || isEditButton) return
   
    if(sameTarget) {
      UniMap.api.openPlaceModal(tid)
    } else if(tid){
        UniMap.api.openMarker(tid)
    } else if(advId){
        UniMap.api.openAdvMarker(advId,slide.attr('data-latlng-target'))
    } else {
        UniMap.console.log(J, event)
    }


    UniMap.console.log({sameTarget,previousTid:UniMap.previousTid,tid})

}

function handleSlideChange(e, places, UniMap) {
       
    const tid = places[e.activeIndex] ? places[e.activeIndex].tid : null;
    if (tid) {
        
        if(UniMap.swipers.cardsCarousel.params?.direction==='vertical'){

        }else{
            UniMap.api.openMarker(tid)
        }
        
    } else {
      UniMap.api.pointerMarker(false)
      UniMap.map.zoomOut(4)
      UniMap.api.shakeElements(['#location-category-filter', '#ua-place-buttons button.active'],'accent-animation');
    }
}


function initializeOrUpdatePlaceModalSwiper() {
  if (UniMap.swipers && UniMap.swipers.topicPlaceSwiper) {
    UniMap.swipers.topicPlaceSwiper.destroy(true, true);
  }
  UniMap.swipers.topicPlaceSwiper = new UniMap.Swiper("#topicPlaceGallery", {
    slidesPerView: "auto",
    mousewheel: true,
    freeMode: true
  });
}




  
  })
  