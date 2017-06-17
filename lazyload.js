(function(){
  'use strict';

  // array to store images
  let images = [];
  // array to receive source links for images
  let imageSources = [];
  // fade in delay in ms
  const FADE_IN_DELAY = 250;

  const removeAndCopyImageSources = () => {
    // get image collection
    images = document.getElementsByTagName('img');
    // convert HTML collection to an array
    images = Array.from(images);
    // iterate through images, pushing sources into array, and removing src from orig
    images.forEach( (image, index)=> {
      imageSources.push(image.src);
      image.removeAttribute('src');
      image.index = index;
      // lazy load will break if images do not have a dimension
      image.style.width='100%';
      image.style.height='400px';
    });
  };

  const shouldBeLoaded = (pic) => {
    // if 1/4 the height of the image is within the viewport (window height plus scrollY). 
     return ((pic.src === undefined || pic.src === '')
              &&
              pic.y <= (  window.innerHeight +
                              window.scrollY -
                              (pic.getBoundingClientRect().height / 4))
            );
  };

  const getLoadListener = (pic) => {
      // add the source, removing it from queue
      pic.src = imageSources.shift();
      pic.loaded = false;
      pic.addEventListener('load', () => {
        pic.loaded = true;
        checkFadeInStatus(pic.index)
      });
      return pic;
  };

  const readyToFadeIn = (pic, images) => {
    const prior = pic ? images[pic.index - 1] : null;
    return pic.loaded &&
     !pic.classList.contains('visible') &&
     (!prior || (prior.loaded && prior.classList.contains('visible')));
  };

  const checkFadeInStatus = (index) => {
    setTimeout(() => {
      const pic = images[index];
      if (pic && readyToFadeIn(pic, images)) {
          pic.classList.add('visible');
        checkFadeInStatus(index +1);
      } else if (index) {
        checkFadeInStatus(index -1);
      }
    }, FADE_IN_DELAY);
  };

  const lazyImageLoad = (pics) => {
    const queue = pics
      .filter( pic => shouldBeLoaded(pic))
      .map( pic => getLoadListener(pic));
  };

  let timeout = 0;
  const delayLoad = () => {
    // a single scroll can fire multiple events, so we use setTimeout to capture fewer events
    clearTimeout(timeout);
    timeout = setTimeout( ()=>{
      lazyImageLoad(images);;
    }, 250);  
  };

  // after the DOM is loaded but before it is rendered
  document.addEventListener("DOMContentLoaded", ()=> removeAndCopyImageSources());
  window.onload = () => lazyImageLoad(images);
  window.onresize = () => lazyImageLoad(images);
  document.addEventListener("scroll", () => delayLoad());

}());
    
  