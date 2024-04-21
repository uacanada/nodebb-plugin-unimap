'use strict';
    define('markers/advMarkers', ["core/variables" /*   Global object UniMap  */], function(UniMap) { 

   
   
    UniMap.api.reserveClusterForAdvMarkers = () => {
        if(UniMap.mapLayers?.advMarkers?._leaflet_id){
            //  UniMap.mapLayers.advMarkers.remove()
              
          } else {
      
              UniMap.mapLayers.advMarkers = UniMap.L.markerClusterGroup(
                          
                  {
                    iconCreateFunction: function (cluster) { // TODO cluster for ads
                        const markers = cluster.getAllChildMarkers();
                        const count = markers.length;
                        const iconSize = Math.floor(count * 1.1 + 48);
                        const anchorSize = iconSize / 2;
                      
                        return L.divIcon({
                          html: count,
                          className: "mycluster",
                          iconSize: L.point(iconSize, iconSize),
                          iconAnchor: [anchorSize, anchorSize]
                        });
                    },
                      
                  }
              );
          }
    }
    

    UniMap.api.populateAdvMarkers = (tags) => {
        if(ajaxify.data.UniMapSettings?.advMarkers?.length>0){

           
            ajaxify.data.UniMapSettings.advMarkers.forEach((m, index) => {
                 try {

                    // TODO add filter logic for TAGS
                    const marker = UniMap.L.marker(m.latlng.split(','), { icon: UniMap.L.divIcon({
                        className: 'advMarker',
                        html: `<div class="d-flex align-items-center" data-adv-marker="${m.id}">
                                <div class="circle-icon rounded-circle shadow d-flex align-items-center justify-content-center" style="color:${m.color}"> <i class="fa fas ${m.icon}"></i> </div>
                                <span class="ms-2 badge-text" style=" line-height: 1; font-size:0.7rem; bold; color: ${m.color}; ">${m.title}</span> 
                              </div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                        popupAnchor: [0, -20],
                      }) })
                        .bindPopup('<div class="p-2">'+m.popup+'</div>')
                        .on("popupopen", (e) => {
                     
                      }).on("click", (e) => {
                        e.sourceTarget.openPopup();
                       
                      });

                      
                        UniMap.mapLayers.advMarkers.addLayer(marker);
                        ajaxify.data.UniMapSettings.advMarkers[index].marker = marker
                } catch (error) {
                    UniMap.console.log(error)
                }

                
            
            })


            if(UniMap.mapLayers?.advMarkers?._leaflet_id){
                try {
                    UniMap.mapLayers.advMarkers.addTo(UniMap.map);
                } catch (error) {
                    UniMap.console.log(error)
                }
                
            }
            

        }

      

        
    }





    UniMap.api.findMatchedAdv=(category,tags)=>{

        const advCards = []
        
        
        for (const m of ajaxify.data.UniMapSettings.advMarkers) {
            try {

               const triggers = m.advMarkerTags.split(',')
               const meta = [...[category],...tags]
               let matchingValues = triggers.filter(value => meta.includes(value));
               if(matchingValues.length>0){
                advCards.push(m)
               }


            } catch (error) {
                UniMap.console.log(error)
            }
        }
        return advCards;
    }


    UniMap.api.openAdvMarker=(id,latlng) =>{

        UniMap.map.setView(latlng.split(','))
        ajaxify.data.UniMapSettings.advMarkers.find(m => m.id == id).marker.openPopup()

    }


})