'use strict';
define('markers/markerFetcher', ["core/variables" /*   Global object UniMap  */], function(UniMap) { 

    
  
      const apiRequest = async () => {
        try {
          const responseRaw = await fetch(UniMap.routers.getplaces);
          const response = await responseRaw.json();
          if (response.status.code === 'ok' &&  response.response?.placesArray?.length) {
            UniMap.previousPlacesArray = response.response.placesArray;
            return response.response.placesArray
          } else if (UniMap.previousPlacesArray) {
            return UniMap.previousPlacesArray
          } else {
            console.warn('Trouble with API');
            return [];
          }
        } catch (error) {
          console.warn(error);
          return [];
        }
      }
  
      
  
      UniMap.api.fetchMarkers = async (fromCache) => {
        
         
        try {
          if(fromCache && UniMap.previousPlacesArray){
           
            return UniMap.previousPlacesArray
          } else {
           const markers = await apiRequest()
           return markers;
          }
        } catch (error) {
          return []
        }
  
         // TODO  await UniMap.api.populatePlaces( UniMap.previousPlacesArray )
  
  
      }
  
  
  
  
  
  
  
  
  
  
  
  })
  
  
  
  