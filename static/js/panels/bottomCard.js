'use strict';
define('panels/bottomCard',["core/variables" /*   Global object UniMap  */], function(UniMap) { 
    UniMap.api.createCardHtml = (profileIcon, tid, parentTabColor, cardTitleWithLinkAndIcon, socialtype, socialIcon, mainUsername, categoryName, eventNameHtml, eventHtml, bodyText) => {
        const cardPlacePic = profileIcon
        ? ` <div class="col-auto">
                <div class="d-flex align-items-start justify-content-end h-100">
                <div style="background:url(${profileIcon}) center center;background-size:cover;width:3rem" class="place-pic me-2 ratio ratio-1x1 rounded-circle uac-inset-shadow"></div> 
                </div>
            </div>`
        : "";
    
        const cardHtml = `<div class="ua-place-card-inner card mx-0 px-0 pt-3 position-relative" data-ua-tid="${tid}">
        <div class="row no-gutters align-items-start">
            <div class="col flex-grow-1">
            <div class="card-body py-1 h-100">
                <h6 class="card-title mb-1" style="color:${parentTabColor};">${cardTitleWithLinkAndIcon}</h6>
                <small class="text-muted"><span class="ua-mini-username text-primary username-${socialtype}">${socialIcon} ${mainUsername}</span></small>
            </div>
            </div>${cardPlacePic}
        </div>
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
        </div>`;
  
    return cardHtml;
  }
})