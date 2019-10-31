import { SortyConfiguration } from '../config/config.js';
import {
  hasPropertyChanged,
} from '../helpers/helpers.js';
import { attachSelectionBehaviour } from './selection.js';
import thumbSizeInit, { makeThumbSizeSelector } from './thumb-size-selector.js';
import {
  setAllImages,
  setThumbSizes,
} from '../actions/loaded-manifest.js';
import {
  setThumbSize,
} from '../actions/ui.js';

const $ = require('jquery');

let store = null;
let manifestStore = null;

// Keep track of previous state for state diffing
// let lastState = null;
let lastManifestState = null;

const isActive = function () {
  return store.getState().selectedCollection.selectedImages.indexOf(this.index) > -1;
};

const isClassified = function () {
  // console.log(this.canvasId, store.getState().derivedManifestsReducer.classifiedCanvases);
  return manifestStore.getState().classifiedCanvases.has(this.canvasId);
};

export const updateThumbsWithStatus = function () {
  // console.log('updateThumbsWithStatus');
  const classifiedThumbs = manifestStore.getState().classifiedCanvases;
  const $thumbs = $('.thumb');

  // Wipe out any existing classified classes (may have been a delete)
  $('.tc--classified').removeClass('tc--classified');

  // Add the classified modifier to any that have been classified
  for (const thumbUri of classifiedThumbs.values()) {
    // console.log(thumbUri);
    $thumbs.filter(`.thumb[data-uri="${thumbUri}"]`).parent().addClass('tc--classified');
  }
  $(window).trigger('lookup');
};

const getThumbsFromCanvas = (canvas, thumbSizes) => {
  const thumbs = {};
  for (const thumbSize of thumbSizes) {
    const min = thumbSize < 100 ? 0 : Math.round(thumbSize * 0.8);
    const max = thumbSize < 100 ? 200 : thumbSize * 2;
    const thumb = canvas.getThumbnail(thumbSize, min, max);
    thumbs[thumbSize] = thumb;
  }
  return thumbs;
};

export const storeThumbs = (canvases) => {
  // console.log('storeThumbs');
  const allImages = [];
  const thumbSizes = manifestStore.getState().thumbSizes;
  let i = 0;
  // console.log('storeThumbs called with', canvases);
  for (const canvas of canvases) {
    const thumbs = getThumbsFromCanvas(canvas, thumbSizes);
    // console.log(canvas);
    allImages.push({
      canvasId: canvas.id,
      fullSrc: canvas.getThumbnail(1000, 800, 2000),
      index: i,
      info: `${canvas.getDefaultImageService().id}/info.json`,
      isActive,
      isClassified,
      thumbs,
    });
    i++;
  }
  // console.log('all images', allImages);
  manifestStore.dispatch(setAllImages(allImages));
};

// Get preferred size ensuring that the preference is valid
const getPreferredSize = () => {
  const preferredSize = parseInt(store.getState().ui.thumbSize, 10);
  const availableThumbSizes = manifestStore.getState().thumbSizes;
  // console.log(availableThumbSizes.indexOf(preferredSize));
  if (availableThumbSizes.indexOf(preferredSize) > -1) {
    return `${preferredSize}`;
  }
  store.dispatch(setThumbSize(availableThumbSizes[0]));
  return `${availableThumbSizes[0]}`;
};

export const drawThumbs = () => {
  // const $title = $('.viewer__title');
  // const $subtitle = $('.viewer__sub-title');
  // $title.text(`${manifestStore.getState().allImages.length}`);
  // console.log('drawThumbs');
  const manifestState = manifestStore.getState();
  if (manifestState.allImages !== null
    && manifestState.allImages.length
    && manifestState.thumbSizes !== null) {
    const $thumbs = $('.thumbs-container');
    $thumbs.empty();
    const preferredSize = getPreferredSize();
    // console.log(preferredSize);
    // console.log(preferredSize);
    for (const image of manifestStore.getState().allImages) {
      // console.log(image, store.getState().loadedManifest.allImages);
      const preferredThumb = image.thumbs[preferredSize];
      const dimensions = preferredThumb.width && preferredThumb.height ?
      `width="${preferredThumb.width}" height="${preferredThumb.height}"` : '';
      const activeClass = image.isActive() ? ' thumb--active' : '';
      const classifiedClass = image.isClassified() ? ' tc--classified' : '';
      const decorations = SortyConfiguration.getCanvasDecorations(image);
      const thumbnail = `
      <div class="tc${classifiedClass}">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB\
        CAQAAAC1HAwCAAAAC0lEQVR42mO8+R8AArcB2pIvCSwAAAAASUVORK5CYII=" class="thumb${activeClass}"
        data-uri="${image.canvasId}"
        data-src="${preferredThumb.url}"
        data-mfp-src="${image.fullSrc.url}"
        data-idx="${image.index}"
        data-info="${image.info}"
        ${dimensions} />
        <button class="thumb__zoom"><i class="material-icons">zoom_in</i></button>
        ${decorations.canvasInfo}
      </div>
      `;
      // console.log(thumbnail);
      $thumbs.append(thumbnail);
    }
    attachSelectionBehaviour();
  }
};

const getThumbSizesFromCanvases = (canvases) => {
  const maxSize = 600;
  const foundSizes = [];
  for (let i = 0; i < Math.min(canvases.length, 10); i++) {
    const canvas = canvases[i];
    if (canvas.thumbnail && canvas.thumbnail.service && canvas.thumbnail.service.sizes) {
      const sizes = canvas.thumbnail.service.sizes;
      for (let j = 0; j < sizes.length; j++) {
        const testSize = Math.max(sizes[j].width, sizes[j].height);
        if (foundSizes.indexOf(testSize) === -1 && testSize <= maxSize) {
          foundSizes.push(testSize);
        }
      }
    }
  }
  return foundSizes;
};

const getSmallMediumLargeSizes = (foundSizes, defaultChoices) => {
  let smallMediumLarge = [];
  if (foundSizes.length === 3) {
    return foundSizes;
  } else if (foundSizes.length === 0) {
    return defaultChoices;
  } else if (foundSizes.length > 3) {
    // Take the lowest, highest and (smallest) middle value
    smallMediumLarge.push(foundSizes[0]);
    smallMediumLarge.push(foundSizes[Math.floor(foundSizes.length / 2)]);
    smallMediumLarge.push(foundSizes[foundSizes.length - 1]);
    return smallMediumLarge;
  }
  // Add some options favouring foundSizes
  smallMediumLarge = foundSizes.splice(0);
  for (const defaultSize of defaultChoices) {
    if (smallMediumLarge.length === 3) break;
    if (smallMediumLarge.indexOf(defaultSize) === -1) {
      smallMediumLarge.push(defaultSize);
    }
  }
  smallMediumLarge.sort((a, b) => a - b);
  return smallMediumLarge;
};

export const storeThumbSizes = (canvases) => {
  // console.log('storeThumbSizes');
  const defaultChoices = [100, 200, 400];
  const foundSizes = getThumbSizesFromCanvases(canvases);
  defaultChoices.sort((a, b) => a - b);
  foundSizes.sort((a, b) => a - b);
  const choices = getSmallMediumLargeSizes(foundSizes, defaultChoices);
  manifestStore.dispatch(setThumbSizes(choices));
};

export const thumbsUpdate = () => {
  // console.log('thumbsUpdate');
  const canvases = manifestStore.getState().canvases;
  storeThumbSizes(canvases);
  storeThumbs(canvases);
  makeThumbSizeSelector();
  drawThumbs();
};

const Events = {
  domReady() {
    manifestStore.subscribe(Events.manifestStoreSubscribe);
  },
  manifestStoreSubscribe() {
    const state = manifestStore.getState();
    if (hasPropertyChanged('canvases', state, lastManifestState)) {
      // console.log('canvases changed');
      // thumbsUpdate();
    }
    if (hasPropertyChanged('manifestData', state, lastManifestState)) {
      // console.log('manifestData changed');
      // drawThumbs();
    }
    lastManifestState = state;
  },
};

export const thumbsInit = (globalStore, globalManifestStore) => {
  store = globalStore;
  manifestStore = globalManifestStore;
  thumbSizeInit(store, manifestStore);
};

$(document).ready(Events.domReady);
