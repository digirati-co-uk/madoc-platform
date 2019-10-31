import { hasPropertyChanged } from '../helpers/helpers.js';
import {receiveLogin, requestLogin} from '../actions/auth';
import {getOmekaToken} from "../helpers/oauth";
import {SortyConfiguration} from "../config/config";
const $ = require('jquery');

let store = null;
let lastState = null;

const DOM = {
  $loginForm: null,
  $userName: null,
  $password: null,
  $submitButton: null,
  $omekaButton: null,
  init() {
    DOM.$loginForm = $('.c-form');
    DOM.$userName = $('.c-form-field__item[name="username"]');
    DOM.$password = $('.c-form-field__item[name="password"]');
    DOM.$submitButton = $('.c-form-submit[type="submit"]');
    DOM.$error = $('.c-form__error');
    DOM.$omekaButton = $('#omeka-login');
  },
};

const Events = {
  domReady() {
    DOM.init();
    Events.init();
    store.subscribe(Events.storeSubscribe);
  },
  init() {
    // DOM.$loginForm.submit(Events.login);
    DOM.$omekaButton.on('click', () => {
        getOmekaToken().then(({ accessToken }) => {
          store.dispatch(receiveLogin({ token: accessToken }));
          SortyConfiguration.navigate.home();
        });
    });
  },
  login(ev) {
    ev.preventDefault();
    store.dispatch(
      requestLogin({
        username: DOM.$userName.val(),
        password: DOM.$password.val(),
      })
    );
  },
  storeSubscribe() {
    const state = store.getState().auth;
    if (hasPropertyChanged('errorMessage', state, lastState)) {
      DOM.$error.text(state.errorMessage);
    }
    lastState = state;
  },
};

export const loginInit = (globalStore) => {
  store = globalStore;
  $(document).ready(Events.domReady);
};

