
'use strict';
define('panels/contextButton',["core/variables" /*   Global object UniMap  */], function(UniMap) { 
    UniMap.api.contextButtonText = ({text,delay,to}) => {
          
        $('#text-info-button').text(text) 
        
        UniMap.swipers.contextButton.slideTo(UniMap.contextButton.router.text)
        UniMap.setTimeout(() => {
          
                if(!UniMap.swipers.contextButton.destroyed){
                    UniMap.swipers.contextButton.slideTo(to)
                } 
                
             // TODO PREVENT IF CHNAGED
             
         }, delay);

     }
   
})