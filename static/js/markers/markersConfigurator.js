'use strict';
define('markers/markersConfigurator',["core/variables" /*   Global object UniMap  */], function(UniMap) { 

    UniMap.api.createMarker = (index,item) => {
          const {
            tid,
            placeCategory,
            placethumb = "",
            pic = "",
            placeTitle,
            categoryName,
            eventCategoryName,
            uid,
            classesFromAdmin,
            eventWeekDay = "",
            eventStartDate = "",
            eventStartTime = "",
            eventName = "",
            eventCategory = "",
            socialtype,
            placeDescriptionAlt,
            placeDescription,
            streetAddress,
            latlng,
            city,
            province,
            mainUsername,
            created,
            placetags,
          } = item;
    
    
          UniMap.api.countFilledCategories(placeCategory);
         
          let eventHtml = "";
          const profileIcon = UniMap.api.getProfileImage(item);
          const markerTitle = placeTitle || categoryName;
          const cardTitle = eventName ? eventName : placeTitle || markerTitle;
          const eventNameHtml = eventName ? `<b>${eventName}</b><br>` : "";
          const subCategoryData = UniMap.subCategoryRouterObject[placeCategory] || {tabs:"all"}
          const parentTabs = subCategoryData.tabs || []
          const faIconClass = subCategoryData.icon || 'fa-map'
          const parentTabColor = UniMap.parentCategoriesObject[parentTabs[0]]?.color
    
          
          
          const faIcon = `<i class="'fa fa-fw fas fa-solid ${faIconClass}"></i>`; 
    
          let markerClassName = `ua-marker-d ua-social-${socialtype} ua-topic-${tid} cat-${placeCategory} marker-${
            UniMap.markersClasses[1] // TODO
          }${classesFromAdmin ? ` ${classesFromAdmin}` : ""}`;
          if (eventCategory) {
            markerClassName += ` ua-marker-event ua-evnt-${eventCategory}`;
            eventHtml += eventStartDate
              ? `<span class="ua-event-popup">📅 ${eventStartDate} ⏰ ${eventStartTime} ${eventCategoryName}</span>`
              : `<span class="ua-event-popup">📅 Every ${eventWeekDay} ⏰ ${eventStartTime} ${eventCategoryName}</span>`;
          }
    
          const socialIcon =  socialtype && socialtype !== "undefined" ? UniMap.socialMediaIcons[socialtype] : '<i class="fa-brands fa-chrome"></i>';
          const cardTitleWithLinkAndIcon = `${faIcon} ${cardTitle}`;
    
          const language = window.navigator.userLanguage || window.navigator.language; // TODO improve
          const langRegex = new RegExp(ajaxify.data.UniMapSettings.altContentTrigger, "mig");
          const bodyTextDetected =
            language.match(langRegex) && placeDescriptionAlt
              ? placeDescriptionAlt
              : placeDescription;
          const bodyText = UniMap.api.harmonizeSnippet({
            text: bodyTextDetected,
            lineslimit: 5,
            maxchars: 300,
          });
         
    
          let words = markerTitle.split(/[\s]|[+-/&\\|]/); // Split into an array of words
    
          let markerTitleFormated = "";
          let lineLength = 0;
          let lineCount = 1;
          let markerHeightClass = "one-line-m";
    
          for (let i = 0; i < words.length; i++) {
            // If adding the next word exceeds the line length and we're already at two lines, truncate and break.
            if (lineLength + words[i].length > 14 && lineCount == 2) {
              markerTitleFormated += "...";
              break;
            }
            // If adding the next word exceeds the line length and we're still on the first line, move to the second line.
            else if (lineLength + words[i].length > 14 && lineCount == 1) {
              markerTitleFormated += "<br>";
              lineLength = 0;
              lineCount++;
              markerHeightClass = "two-line-m";
            }
    
            // Add the next word to the line.
            markerTitleFormated += words[i] + " ";
            lineLength += words[i].length + 1; // +1 for the space
          }
    
          markerTitleFormated = markerTitleFormated.trim(); // Remove leading and trailing spaces
    
          const markerLineIcon = UniMap.L.divIcon({
            className: markerClassName,
            html: `<div class="ua-markers d-flex align-items-center ${markerHeightClass}">
                    <div class="circle-icon rounded-circle shadow d-flex align-items-center justify-content-center">
                    ${faIcon}
                    </div>
                    <span class="ms-1 badge-text">${markerTitleFormated}</span> 
                  </div>`,
            iconSize: [24, 24],
            iconAnchor: [11, 35],
            popupAnchor: [0, 0],
          });
    
          const marker = UniMap.L.marker(latlng, { icon: markerLineIcon })
            .bindPopup(`<a class="ua-popup-link" href="/topic/${tid}/1">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item">${faIcon} ${markerTitle}</li>
                  ${
                    streetAddress
                      ? ` <li class="list-group-item">📬 ${streetAddress}</li>`
                      : ""
                  } 
                  <li class="list-group-item"><i class="fa-solid fa-tree-city"></i> ${
                    city
                  }, ${province}</li>
                </ul>
                </a>`);
    
          const cardPlacePic = profileIcon
            ? ` <div class="col-auto">
            <div class="d-flex align-items-start justify-content-end h-100">
            <div style="background:url(${profileIcon}) center center;background-size:cover;width:3rem" class="place-pic me-2 ratio ratio-1x1 rounded-circle uac-inset-shadow"></div> </div>
            </div>`
            : "";
            
           
        const cardHtml = `<div class="ua-place-card-inner card mx-0 px-0 pt-3 position-relative" data-ua-tid="${tid}">
          <div class="row no-gutters align-items-start">
            <div class="col flex-grow-1">
              <div class="card-body py-1 h-100">
                <h6 class="card-title mb-1" style="color:${parentTabColor};">${cardTitleWithLinkAndIcon}</h6>
                <small class="text-muted"><span class="ua-mini-username text-primary username-${socialtype}">${socialIcon} ${mainUsername}</span></small>
              </div>
            </div>${cardPlacePic}</div>
          <div class="row">
            <div class="col-12">
              <div class="card-body">
              <p class="card-text"><span class="badge rounded-pill text-bg-fancy">${categoryName}</span>
              ${eventNameHtml}
              ${eventHtml}
              ${bodyText}
              </p>
              </div>
            </div>
          </div>
        </div>`
    
    
          const eventDate = eventStartDate ? new Date(`${eventStartDate} ${eventStartTime}`):0;
          const eventTimestamp = eventDate ? Math.floor(eventDate.getTime() / 1000) : 0;
    
          marker.uaMarkerCardHTML = cardHtml;
          marker.number = index;
          marker.tid = Number(tid);
          marker.eventTimestamp = eventTimestamp
          marker.icon = faIcon;
          marker.on("popupopen", (e) => {
            UniMap.lastPlaceMarker = e.sourceTarget;
            UniMap.api.fitElementsPosition();
          });
          marker.on("click", (e) => {
            e.sourceTarget.openPopup();
            UniMap.api.openCards(e.sourceTarget.tid, "distance", false); // TODO: 'category' or 'distance'
          });
    
          UniMap.allPlaces[tid] = {
            marker,
            gps: latlng,
            json: item,
            parentTabColor,
            faIconClass,
            parentTabs,
            index
          };
    
            UniMap.currentSortedMarkers.push({ tid, lat: latlng[0],  lng: latlng[1], json: item, html: cardHtml});
           
          if (eventTimestamp > 0) {
              UniMap.TEMP.eventsArray.push({tid, eventTimestamp, everyWeek: eventWeekDay, category: placeCategory, eventcategory:eventCategory, tags: placetags});
            }else{
              UniMap.TEMP.placesArray.push({tid, createdTimestamp:created, category:placeCategory, tags: placetags});
          }



          return marker;
    
    }

   

})