'use strict';
define('population/swipeDetectors',["core/variables" /*   Global object UniMap  */], function(UniMap) { 

	const handleTabCategories = (UniMap, tab, index) => {
		const { placeByTagCollector, slug, color, icon } = tab;
	
		const tagCollector = placeByTagCollector?.length > 0 ? placeByTagCollector.split(",") : [];
		tagCollector.forEach((tag) => {
			UniMap.tabCollectorTags[tag] = UniMap.tabCollectorTags[tag]?.length > 0
				? UniMap.tabCollectorTags[tag].push(slug)
				: [slug];
		});
	
		UniMap.parentCategoriesObject[slug] =  {color, icon, tagCollector}
	};
	
	
	
	
	
	const createSubCategories = () =>{
	
		
		const selectEl = $("#location-category")
		let optionsElements = ''
	
		const handleSubCategories = (category, index) => {
			try {
				const {slug,cid,cidname,parents,name,icon,visibleOnlyWhenChosen} = category
				const tabs = UniMap.utils.tagsParseJSON(parents)
				optionsElements += `<option value="${slug}">${name}</option>`

				UniMap.subCategoryRouterObject[slug] = {tabs,name,cid,icon,cidname,visibleOnlyWhenChosen,total:0}
			} catch (error) {
				console.error(error);
			}
		}
	
		try {
			
			ajaxify.data.UniMapSettings.subCategories.forEach((category, index) => { handleSubCategories(category, index); });
			selectEl.html(optionsElements)
	
		} catch (error) {
			
			console.error(error);
		}
	}
	
	
	
	const createEventCategories = () => {
	
	   
		const selectEl = $("#event-location-category")
		let optionsElements = ''
	
		const handleEventCategories = (category, index) => {
				const {slug,name} = category
				optionsElements += `<option value="${slug}">${name}</option>`
		}
	
		try {
			
			ajaxify.data.UniMapSettings.eventCategories.forEach((category, index) => { handleEventCategories(category, index); });
			selectEl.html(optionsElements)
	
		} catch (error) {
			
			console.error(error);
		}
	}
	
	
	
	
	const createTabs = () => {
		try {
			
			UniMap.TEMP.bottomPanelCategoryButtons = [UniMap.api.createBotomPanelCategoryButton({ color:'#01d61d', icon:'fa-info', slug:'widgets' }, 0)]
			ajaxify.data.UniMapSettings.tabCategories.forEach((tab, index) => { 
				handleTabCategories(UniMap, tab, index+1); 
				UniMap.TEMP.bottomPanelCategoryButtons.push(UniMap.api.createBotomPanelCategoryButton(tab, index+1))
			});
			let innerButtonsHtml = UniMap.TEMP.bottomPanelCategoryButtons.join('');
			UniMap.fragment.createFragment('bottomPanelCategoryButtons', `<div class="swiper-wrapper">${innerButtonsHtml}</div>`);
			UniMap.TEMP.bottomPanelCategoryButtons = null;
			innerButtonsHtml = null;
		} catch (error) {
			UniMap.console.error(error);
		}
	}

    

	UniMap.api.countFilledCategories=(cat)=>{

		if(UniMap.subCategoryRouterObject[cat]?.total > 0){
			UniMap.subCategoryRouterObject[cat].total = UniMap.subCategoryRouterObject[cat].total+1;
		}else if(UniMap.subCategoryRouterObject[cat]){
			UniMap.subCategoryRouterObject[cat].total = 1;
		}else{
			UniMap.console.log("no category in subCategoryRouterObject")
		}
	}



	UniMap.api.createCategories = () => {
		UniMap.parentCategoriesObject = {}
		UniMap.subCategoryRouterObject = {}
		UniMap.tabCollectorTags = {}

		createTabs();
		createSubCategories();
		createEventCategories();
	}






})