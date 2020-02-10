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

import {checkLogin} from './helpers/jwt';
import { SortyConfiguration } from './config/config';

const $ = require('jquery');
window.$ = window.jQuery = $;
require('./vendor/jquery.unveil.js');
require('leaflet');
require('./vendor/leaflet-iiif.js');
require('magnific-popup');

checkLogin().then(() => {
  sourceListInit();
  helpInit();
  thumbsInit();
  derivedManifestsInit();
  classifyToolsInit();
  selectionInit();
  inputInit();
  makeManifestInit();
  lightboxInit();
}).catch((e) => {
  if (window.location.pathname !== SortyConfiguration.path + '/login.html') {
    SortyConfiguration.navigate.login();
  } else {
    loginInit();
  }
});
