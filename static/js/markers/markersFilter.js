'use strict';
    define('markers/markersFilter', ["core/variables" /*   Global object UniMap  */], function(UniMap) { 
    
    UniMap.api.filterMarkers = (criteria,markers) => {

      if (!UniMap.allPlaces) {
        return UniMap.console.log(`No places`);
      }
      if (UniMap.pointerMarker) {
          UniMap.map.removeLayer(UniMap.pointerMarker);
      }

      for (const category in UniMap.categoryClusters) {
        const clusterGroup = UniMap.categoryClusters[category];
        UniMap.map.removeLayer(clusterGroup)
      }


      const mustBeInCategory = $("#location-category-filter").val();
      const markersCategory = mustBeInCategory || 'allMarkersCluster'
      UniMap.map.addLayer(UniMap.categoryClusters[markersCategory])
      
      UniMap.currentSortedMarkers = []
      
      for (const tid in UniMap.allPlaces) {
        if (Object.hasOwnProperty.call(UniMap.allPlaces, tid)) {
          const place = UniMap.allPlaces[tid];
          if(!place) continue;
          
          if (!mustBeInCategory || mustBeInCategory === place.json.placeCategory){
            // TODO: add more sorting options
            UniMap.currentSortedMarkers.push({ tid, lat: place.marker._latlng.lat,  lng: place.marker._latlng.lng, json: place.json, html: place.marker.uaMarkerCardHTML});
            
          }
        }
      }

      UniMap.currentSortedMarkers= [...UniMap.currentSortedMarkers]
      return UniMap.currentSortedMarkers;


      

    }

    


    // TODO refactor
    UniMap.api.rewriteTabs = (criteria) => {
           // UniMap.api.rewriteTabs deprecated, new method is    UniMap.api.filterMarkers(criteria)   instead')
            UniMap.api.filterMarkers(criteria)
    }
  

})