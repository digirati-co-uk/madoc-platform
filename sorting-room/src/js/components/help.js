import { hasPropertyChanged } from '../helpers/helpers.js';
import { toggleHelpVisible } from '../actions/ui.js';

const $ = require('jquery');

let store = null;
let lastState = null;

const DOM = {
  $helpButton: null,
  $helpText: null,

  init() {
    DOM.$helpButton = $('.help-button');
    DOM.$helpText = $('.help');
  },
};

const Events = {
  domReady() {
    DOM.init();
    Events.init();
    store.subscribe(Events.storeSubscribe);
  },
  init() {
    DOM.$helpButton.click(Events.helpToggle);
  },
  helpToggle() {
    store.dispatch(toggleHelpVisible());
  },
  storeSubscribe() {
    const state = store.getState().ui;
    if (hasPropertyChanged('helpVisible', state, lastState)) {
      if (state.helpVisible) {
        DOM.$helpButton.addClass('help-button--active');
        DOM.$helpText.addClass('help--active');
      } else {
        DOM.$helpButton.removeClass('help-button--active');
        DOM.$helpText.removeClass('help--active');
      }
    }
    lastState = state;
  },
};

export const helpInit = (globalStore) => {
  store = globalStore;
};

$(document).ready(Events.domReady);
