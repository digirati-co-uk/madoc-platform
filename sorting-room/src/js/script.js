// Redux
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

// Reducers
import reducers from './reducers/index.js';
import { loadedManifest } from './reducers/loaded-manifest.js';

// Imports
import { selectionInit } from './components/selection.js';

import classifyToolsInit from './components/classify-tools.js';

import {
  derivedManifestsInit,
} from './components/derived-manifests.js';
import { inputInit } from './components/input.js';

import {
  thumbsInit,
} from './components/thumbs.js';
import { } from './components/workspace.js';

import {
  makeManifestInit,
} from './components/make-manifest-modal.js';

import {
  lightboxInit,
} from './components/lightbox.js';

import {
  helpInit,
} from './components/help.js';

import { loginInit } from './components/login.js';

import sourceListInit from './components/source-list.js';

import { hasValidToken } from './helpers/jwt';
import { SortyConfiguration } from './config/config';

const $ = require('jquery');
window.$ = window.jQuery = $;
require('./vendor/jquery.unveil.js');
require('leaflet');
require('./vendor/leaflet-iiif.js');
require('magnific-popup');


if (!hasValidToken() && window.location.pathname !== SortyConfiguration.path + '/login.html') {
  SortyConfiguration.navigate.login();
} else {
  // Create the store for the application - hook up redux devtools
  /* eslint-disable no-underscore-dangle */
  const store = createStore(reducers,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), compose(
        applyMiddleware(thunk)
      ));
  const manifestStore = createStore(loadedManifest,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), compose(
      applyMiddleware(thunk)
    ));
  /* eslint-enable */


  // Pass the store to component initialisers
  loginInit(store, manifestStore);
  sourceListInit(store, manifestStore);
  helpInit(store);
  thumbsInit(store, manifestStore);
  derivedManifestsInit(store, manifestStore);
  classifyToolsInit(store, manifestStore);
  selectionInit(store, manifestStore);
  inputInit(store, manifestStore);
  makeManifestInit(store, manifestStore);
  lightboxInit(store, manifestStore);
}
