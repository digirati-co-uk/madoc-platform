import {
  hasPropertyChanged,
} from '../helpers/helpers.js';
import {
  setThumbSize,
} from '../actions/ui.js';
import {
  drawThumbs,
} from './thumbs.js';

const $ = require('jquery');

let store = null;
let manifestStore = null;

let lastState = null;

const Init = (globalStore, globalManifestStore) => {
  store = globalStore;
  manifestStore = globalManifestStore;
  const thumbSize = window.localStorage ? localStorage.getItem('thumbSize') : null;
  if (typeof thumbSize !== 'undefined' && thumbSize !== null) {
    store.dispatch(setThumbSize(thumbSize));
  } else {
    store.dispatch(setThumbSize(100));
  }
};
export default Init;

const DOM = {
  $thumbSizeButtons: null,
  $thumbSizeSmall: null,
  $thumbSizeMedium: null,
  $thumbSizeLarge: null,

  init() {
    DOM.$thumbSizeButtons = $('.thumb-size__button');
    DOM.$thumbSizeSmall = $('.thumb-size__button--small');
    DOM.$thumbSizeMedium = $('.thumb-size__button--medium');
    DOM.$thumbSizeLarge = $('.thumb-size__button--large');
  },
};

const updateThumbSelectorState = () => {
  const state = store.getState().ui;
  DOM.$thumbSizeButtons.removeClass('thumb-size__button--active');
  DOM.$thumbSizeButtons.filter(`button[data-thumb-size=${state.thumbSize}]`)
  .addClass('thumb-size__button--active');
};

export const makeThumbSizeSelector = () => {
  const choices = manifestStore.getState().thumbSizes;
  DOM.$thumbSizeSmall.attr('data-thumb-size', choices[0]);
  DOM.$thumbSizeMedium.attr('data-thumb-size', choices[1]);
  DOM.$thumbSizeLarge.attr('data-thumb-size', choices[2]);
  updateThumbSelectorState();
};

const Events = {
  domReady() {
    DOM.init();
    DOM.$thumbSizeButtons.click(Events.sizeClick);
    store.subscribe(Events.storeSubscribe);
  },
  sizeClick() {
    const thumbSizeToSet = $(this).attr('data-thumb-size');
    $(this).blur();
    localStorage.setItem('thumbSize', thumbSizeToSet);
    store.dispatch(setThumbSize(thumbSizeToSet));
    drawThumbs();
  },
  storeSubscribe() {
    const state = store.getState().ui;
    if (hasPropertyChanged('thumbSize', state, lastState)) {
      updateThumbSelectorState();
    }
    lastState = state;
  },
};

$(document).ready(Events.domReady);
