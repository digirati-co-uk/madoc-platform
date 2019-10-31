import { hasPropertyChanged } from '../helpers/helpers.js';
import {
    setCurrentImage,
} from '../actions/ui.js';
import L from 'leaflet';
import {
  addOrRemoveFromSelection,
  setCollectionName,
} from '../actions/selected-collection.js';

const $ = require('jquery');

let store = null;

let lastLocalLightboxState = null;
const thumbsContainer = '.thumbs-container';
let map = null;

const createDeepZoomViewer = () => {
  const $thumb = $(`.thumb[data-mfp-src='${$('.mfp-img').attr('src')}']`);
  $('.mfp-container').prepend('<div class="zoom-toolbar__map" id="map"></div>');
  $('#map').click((e) => e.stopPropagation());
  map = L.map('map', {
    center: [0, 0],
    crs: L.CRS.Simple,
    zoom: 3,
  }).on('layeradd', (e) => {
    setTimeout(() => {
      e.target.setZoom(3);
    }, 1000);
    // e.target.panTo(center);
  });

  L.tileLayer.iiif($thumb.attr('data-info')).addTo(map);
};

const destroyDeepZoomViewer = () => {
  if (map !== null) {
    map.remove();
    $('#map').remove();
    map = null;
  }
};

const zoomInButtonText = '<i class="material-icons">zoom_in</i> Zoom in';
const zoomOutButtonText = '<i class="material-icons">zoom_out</i> Zoom out';

const deepZoomToggle = function () {
  if ($('#map').length) {
    $(this).removeClass('zoom-toolbar__zoom-button--active').html(zoomInButtonText);
    destroyDeepZoomViewer();
  } else {
    $(this).addClass('zoom-toolbar__zoom-button--active').html(zoomOutButtonText);
    createDeepZoomViewer();
  }
};

const isIndexInSelection = (idx) => {
  if (store.getState().selectedCollection.selectedImages
  .indexOf(parseInt(idx, 10)) > -1) return true;
  return false;
};

const addOrRemoveClick = () => {
  const $thumb = $(`.thumb[data-mfp-src='${$('.mfp-img').attr('src')}']`);
  const idx = $thumb.attr('data-idx');
  store.dispatch(addOrRemoveFromSelection(idx));
  // console.log(store.getState().select);
  if (isIndexInSelection(idx)) {
    $('.zoom-toolbar').addClass('zoom-toolbar--selected');
  } else {
    $('.zoom-toolbar').removeClass('zoom-toolbar--selected');
  }
};

const collectionNameChange = function (e) {
  e.stopPropagation();
  // console.log('collectionNameChange', $(this).val());
  store.dispatch(setCollectionName($(this).val()));
};

const createPopupToolbar = () => {
  const collectionName = store.getState().selectedCollection.collectionName !== null ?
  store.getState().selectedCollection.collectionName : '';
  const isSelected = isIndexInSelection(store.getState().ui.lightbox.currentImage.idx) ?
  ' zoom-toolbar--selected' : '';
  const $toolbar = $(`
    <ul class="zoom-toolbar${isSelected}">
      <li class="zoom-toolbar__item zoom-toolbar__collection-name" style="display:none">
        <input id="collection-name" type="text"
        value="${collectionName}" placeholder="Name your collection" />
      </li>
      <li class="zoom-toolbar__item">
        <button class="btn zoom-toolbar__zoom-button">
        <i class="material-icons">zoom_in</i> Zoom in</button>
      </li>
      <li class="zoom-toolbar__item">
        <button class="btn zoom-toolbar__select-button">
          <span class="zoom-toolbar__zoom-button-add">
          <i class="material-icons">add_circle</i> Add to selection</span>
          <span class="zoom-toolbar__zoom-button-remove">
          <i class="material-icons">remove_circle</i> Remove from selection</span>
        </button>
      </li>
    </ul>
  `);

  $('.mfp-gallery').addClass('mfp-toolbar').append($toolbar);
  $('.zoom-toolbar__collection-name input').keyup(collectionNameChange);
  // console.log($('#collection-name'));
  $('.zoom-toolbar').click((e) => { e.stopPropagation(); });
  $('.zoom-toolbar__zoom-button').click(deepZoomToggle);
  $('.zoom-toolbar__select-button').click(addOrRemoveClick);
};

const destroyPopupToolbar = () => {
  $('.zoom-toolbar').remove();
  $('.mfp-with-zoom').removeClass('mfp-toolbar');
};

const Config = {
  magnificOptions: {
    callbacks: {
      change() {
        const $thumb = $(`.thumb[data-mfp-src='${$(this.content).find('.mfp-img').attr('src')}']`);
        const currentImageData = {
          idx: $thumb.attr('data-idx'),
          info: $thumb.attr('data-info'),
        };
        // console.log(currentImageData, store.getState().select.currentImage);
        store.dispatch(setCurrentImage(currentImageData));
        destroyDeepZoomViewer();
      },
      close() {
        destroyDeepZoomViewer();
        destroyPopupToolbar();
      },
      open() {
        createPopupToolbar();
      },
    },
    delegate: 'img.thumb:visible',
    type: 'image',
    closeOnContentClick: false,
    closeBtnInside: false,
    closeOnBgClick: false,
    mainClass: 'mfp-with-zoom mfp-img-mobile',
    image: {
      verticalFit: true,
    },
    gallery: {
      enabled: true,
    },
    zoom: {
      enabled: true,
      duration: 300, // don't foget to change the duration also in CSS
      opener(element) {
        return element;
      },
    },
  },
};

const Events = {
  storeSubscribe() {
    const lightboxState = store.getState().ui.lightbox;
    if (hasPropertyChanged('currentImage', lightboxState, lastLocalLightboxState)) {
      if (isIndexInSelection(lightboxState.currentImage.idx)) {
        $('.zoom-toolbar').addClass('zoom-toolbar--selected');
      } else {
        $('.zoom-toolbar').removeClass('zoom-toolbar--selected');
      }
      // console.log('current image changed', state.currentImage);
    }
    lastLocalLightboxState = lightboxState;
  },
  thumbZoomClick() {
    const $thisContainer = $(this).closest('.tc');
    // const $thisThumb = $thisContainer.find('.thumb');
    const posInThumbs = $('.tc:visible').index($thisContainer);
    // console.log(posInThumbs);
    $(thumbsContainer).magnificPopup('open', posInThumbs);
  },
};

export const attachMagnific = () => {
  $(thumbsContainer).removeData('magnificPopup');
  $(thumbsContainer).magnificPopup(Config.magnificOptions);
};

export const lightboxInit = (globalStore) => {
  store = globalStore;
  store.subscribe(Events.storeSubscribe);
};

export const attachLightboxBehaviour = () => {
  $('.thumb__zoom').click(Events.thumbZoomClick);
  attachMagnific();
};
