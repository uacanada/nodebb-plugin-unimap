'use strict';
define('utils/mapFeatures', ["core/variables" /*   Global object UniMap  */], function(UniMap) { 

    UniMap.api.debouncedShow = utils.debounce(() => { 
        UniMap.setTimeout(() => { 
            if($('body').hasClass('cards-opened')){
                // TODO
            }else{
            $('body').removeClass('hiddenElements');
            }
        }, 800); 
    }, 200);

    UniMap.api.hideElements = (forced) => {
        if(forced){
            if($('body').hasClass('unimap-page')){
                $('body').addClass('hiddenElements');
                
            }else{
                UniMap.api.debouncedShow()
            }
           
        } else {
            UniMap.api.debouncedShow()
            
        }
    };

   

    UniMap.api.fancyHeroText = (() => {

        if(!ajaxify.data.UniMapSettings?.slogans) return;
		let intervalId = null;
		const slogans = ajaxify.data.UniMapSettings.slogans.map(object => object.slogan) 
		const colors = ['#000'];
		let i = 0;
		let j = 0;
		
		// Timing values
		const charDisplayDelay = 80;  // Delay for each character to be displayed
		const fadeInTime = 300;  // Duration of fadeIn effect
		const pauseBetweenSlogans = 2000;  // Pause between displaying each slogan
		const fadeOutTime = 100;  // Duration of fadeOut effect
	
		const displaySlogan = () => {
			const slogan = slogans[i].split("");
			$('#fancy-hero').empty();
	
			slogan.forEach((char, idx) => {
				const span = $(`<span>${char}</span>`);
				span.hide().appendTo('#fancy-hero').delay(idx * charDisplayDelay).fadeIn(fadeInTime);
			});
	
			$('#fancy-hero').css('color', colors[j]);
	
			i = (i + 1) % slogans.length;
			j = (j + 1) % colors.length;
	
			return slogan.length*1.5;
		};
	
		const start = () => {
			if (intervalId !== null) {
				return;
			}
	
			const initialSloganLength = displaySlogan();
			intervalId = setInterval(() => {
				$('#fancy-hero').delay(pauseBetweenSlogans).fadeOut(fadeOutTime, function() {
					$(this).empty().show();
					const nextSloganLength = displaySlogan();
					intervalId = UniMap.setTimeout(() => {}, nextSloganLength * charDisplayDelay + pauseBetweenSlogans);
				});
			}, initialSloganLength * charDisplayDelay + pauseBetweenSlogans);
		};
	
		const stop = () => {
			if (intervalId !== null) {
				clearInterval(intervalId);
				intervalId = null;
			}
		};
	
		return {
			start,
			stop
		};
	})()
	

    UniMap.api.smoothPanMap = async (dx, dy, duration) => {
        const {map} = UniMap
        const currentCenter = map.getCenter();
    
        const newCenter = map.containerPointToLatLng(
            map.latLngToContainerPoint(currentCenter).add([dx, dy])
        );
    
        // Create a new promise that resolves after a certain duration
        const delay = (duration) => new Promise(resolve => UniMap.setTimeout(resolve, duration));
    
        // Fly to the new point
        map.flyTo(newCenter, map.getZoom(), {duration: duration});
    
        // Wait for the specified duration plus a small delay, then fly back
        await delay(duration * 1000 + 500);
        map.flyTo(currentCenter, map.getZoom(), {duration: duration});
    }

UniMap.api.getMarkersInView = () => {
    const markers =UniMap.currentSortedMarkers;
    if (!UniMap.map || markers.length === 0) return [];

    let markersInView = [];

    let closestMarker = null;
    let closestDistance = Infinity;

    

    let bounds = UniMap.map.getBounds();
    let center = UniMap.map.getCenter();

    for (let i = 0; i < markers.length; i++) {
        const { lat, lng } = markers[i];
        let markerLatLng = UniMap.L.latLng(lat, lng);
        if (bounds.contains(markerLatLng)) {
            markersInView.push(markers[i]);
        } else {
            // Calculate the distance from the marker to the center
            let distance = center.distanceTo(markerLatLng);
            // If this distance is less than the closest recorded distance,
            // update the closest marker and closest distance.
            if (distance < closestDistance) {
                closestMarker = markers[i];
                closestDistance = distance;
            }
        }
    }

    return { markersInView, closestMarker };
};

UniMap.api.adjustCenterToSomePlace = () => {
        
        const { closestMarker } = UniMap.api.getMarkersInView();
        
        if (closestMarker) {
            const { lat, lng } = closestMarker;
            const closestPlace = [lat, lng];
            UniMap.map.setView(closestPlace, 11);
            return closestPlace;
        } else {

          
            
            return null; 
        }
}



UniMap.api.markerIterator = {
    shouldStop: false,
    async run() {
        const { markersInView } = UniMap.api.getMarkersInView();  
        for (let i = 0; i < markersInView.length; i++) {
            if (this.shouldStop) {
                this.shouldStop = false;  
                break;
            }

            await new Promise(resolve => UniMap.setTimeout(resolve, 2000));

            if(markersInView[i].lat && !markersInView[i].blacklisted){

                const { lat, lng, tid } = markersInView[i];
                //UniMap.map.setView(L.latLng(lat, lng), 11);
                UniMap.map.flyTo(L.latLng(lat, lng), 11);
                UniMap.console.log({tid})

            };
            
        }
    },
    stop() {
        this.shouldStop = true;
    },
}

})