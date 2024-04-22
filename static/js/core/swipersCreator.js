"use strict";
define("core/swipersCreator", [
  "core/variables" /*   Global object UniMap  */,
], function (UniMap) {
  UniMap.api.initializeSwipers = () => {
      const { Swiper } = UniMap;

      UniMap.swipers.contextButton = new Swiper("#context-buttons-swiper .swiper", {
            allowTouchMove: false,
            effect: "creative",
            creativeEffect: {
          prev: {
            shadow: true,
                translate: [0, 0, -2000],
                rotate: [180, 0, 5],
                opacity:0
          },
          next: {
            shadow: true,
                translate: [0, 0, -2000],
                rotate: [180, 0, 15],
            opacity: 1, // Fade in
          }
        }
      })

      UniMap.swipers.buttonsSlider = new Swiper("#ua-sheet-swiper-buttons", {
        slidesPerView: "auto",
        freeMode: true,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        nested: false,
      }).on("click", (swiper, event) => {
        UniMap.swipers.tabsSlider.slideTo(swiper.clickedIndex);
      });

      UniMap.swipers.tabsSlider = new Swiper("#ua-sheet-swiper-tabs", {
        slidesPerView: 1,
        setWrapperSize: true,
      }).on("slideChange", (swiper, event) => {
          const activeIndex = UniMap.swipers.tabsSlider.activeIndex;
          UniMap.swipers.vertical[activeIndex].slideTo(0);
          UniMap.swipers.buttonsSlider.slideTo(activeIndex);
          UniMap.swipers.buttonsSlider.slides.forEach((slide) => {
            slide.classList.remove("active-tab");
          });
          UniMap.swipers.buttonsSlider.slides[activeIndex].classList.add(
            "active-tab"
          );
        });
  };
});
