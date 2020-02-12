import { hasPropertyChanged } from '../helpers/helpers.js';
import { toggleHelpVisible } from '../actions/ui.js';
import { store } from '../store';
import {removeUserToken} from "../helpers/jwt";
import {SortyConfiguration} from "../config/config";

const $ = require('jquery');

let lastState = null;

const DOM = {
  $helpButton: null,
  $helpText: null,
  $logout: null,

  init() {
    DOM.$helpButton = $('.help-button');
    DOM.$helpText = $('.help');
    DOM.$logout = $('.logout');
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
    DOM.$logout.click(Events.logout);
  },
  logout() {
    removeUserToken();
    SortyConfiguration.navigate.login();
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

export const helpInit = () => {
  // store = globalStore;
};

$(document).ready(Events.domReady);
