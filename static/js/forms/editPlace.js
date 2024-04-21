'use strict';
define('forms/editPlace',["core/variables" /*   Global object UniMap  */], function(UniMap) { 

    UniMap.form.reset = () => {
        
        document.getElementById("placeForm").reset()
        UniMap.form.tags = []
        $("#tag-container").html('')
         $("#ua-form-event-holder").html('')


    }

    UniMap.api.clearFormFields=()=>{
        $('#uaMapAddress').val('');
        $('#subaddress').val('');
        $('#ua-newplace-city').val('');
        $("#ua-latlng-text").val('');
    };

    UniMap.form.socialTypeIconAdjust = (e) => {
        try {
            const inputs = 'form#placeForm input[name="socialtype"]';
            const checkedInput = $(inputs).filter(':checked');
            const ico = checkedInput.next().find('i');
            const icoFaClasses = ico.attr('class');
            const icoStyle = ico.attr('style');
            
            const socialtypeIco = $('#socialtype-ico');
            if (icoFaClasses) {
              socialtypeIco.attr('class', icoFaClasses);
            }
            else {
              socialtypeIco.attr('class', 'fa-solid fa-at');
            }
            
            if (icoStyle) {
              socialtypeIco.attr('style', icoStyle);
            }
            else {
              socialtypeIco.removeAttr('style');
            }
            
           

        } catch (error) {
          
        }
        
    }

    UniMap.form.editPlace = (tid) => {
      const topic_id = tid ? Number(tid) : 0;
      if (!topic_id) return;
      
      UniMap.form.reset();
    
      fetch(`/api/v3/plugins/map/getplace/${topic_id}`, { method: "GET" })
        .then((res) => res.json())
        .then((x) => {
          if (x?.response?.tid && x?.response?.placeOnMap) {
            const place = x.response.placeOnMap;

            $('#place-tag-input').tagsinput('removeAll');
            $('#place-tag-input').val('')
    
            if (place.eventCategory) {
              $("#ua-form-event-holder").html(UniMap.uaEventPartFormHTML);
              $("#eventSwitcher").prop("checked", true);
            }
    
            UniMap.choosedLocation = place.latlng.length === 2 ? place.latlng : UniMap.defaultLatLng;
            $("#ua-latlng-text").val(UniMap.choosedLocation.join(","));
    
           
    
            $('form#placeForm [name="tid"]').val(topic_id);
    
            for (const inputKey in place) {
              try {
                if (inputKey == "eventWeekDay" || inputKey == "socialtype") {
                  const value = place[inputKey] ?? "";
                  $(`form#placeForm [value="${value}"]`).prop("checked", true);
                  
                  if (inputKey == "socialtype") UniMap.form.socialTypeIconAdjust();
                } else if (inputKey == "placetags" && place['placetags'].length > 0) {

                  const tagString =  place['placetags'].join(',')
                 
                  $('#place-tag-input').val(tagString)
                  $('#place-tag-input').tagsinput('add',tagString)

                } else if (inputKey == "gallery") {

                  const mainImageIndex = Number(place["mainImage"]) || 0
                  $('#mainImage').val(mainImageIndex);
                  for (const [i, img] of place["gallery"].entries()) {
                    let initMainMark = i === mainImageIndex ? 'mainPlaceImg' : ''; 
                    $("#ua-form-img-holder").append('<div data-image-index="' + i + '" class="image-preview d-flex flex-column align-items-center m-2 ' + initMainMark + '"> <img class="set-image me-1" src="/assets/uploads' + img + '"/> </div>');
                  }
                  

                } else if (inputKey == "image") {
                   if(place["placethumb"]){
                    $("#ua-form-img-holder").append('<img src="'+place["placethumb"]+'"/>')

                   }

                   


                 
                } else {
                  $(`form#placeForm [name="${inputKey}"]`).val(place[inputKey]);
                }
              } catch (error) {
                UniMap.console.log(place[inputKey], error);
              }
            }
    
            $("#place-creator-offcanvas").offcanvas("show");
          } else {
           
          }
        })
        .catch((error) => {
          UniMap.console.log("Request failed", error);
        });
    
      UniMap.api.toggleFs();
    }
    
    
})