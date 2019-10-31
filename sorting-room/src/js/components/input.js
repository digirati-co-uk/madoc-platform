import { hasPropertyChanged } from '../helpers/helpers.js';
import {
  resetDerivedManifests,
  setCanvases,
  setManifest,
  setManifestData,
} from '../actions/loaded-manifest.js';
import {
  setLoading,
} from '../actions/ui.js';
import {
  clearSelection,
} from '../actions/selected-collection.js';
import { thumbsUpdate } from './thumbs.js';
import { getCreatedManifests } from './derived-manifests.js';
import { IIIF } from '../helpers/iiif.js';
import { IIIFActions } from './iiif-actions.js';

const $ = require('jquery');

let store = null;
let manifestStore = null;

let lastLocalLoadedManifestState = null;
let lastLocalState = null;

let Actions = {};
let DOM = {};
let Events = {};

DOM = {
  $manifestInputContainer: null,
  $manifestInput: null,
  $manifestInputLoad: null,

  init() {
    DOM.$html = $('html');
    DOM.$manifestInputContainer = $('.manifest-input');
    DOM.$manifestInput = $('.manifest-input__text-input');
    DOM.$manifestInputLoad = $('.manifest-input__load-button');
    DOM.$manifestInputFeedback = $('.manifest-input__feedback');
  },
};

/*
function showCollectionUI() {
  if (SortyConfiguration.sourceCollection) {
    const $collectionLister = $('#collectionLister');
    $collectionLister.click(() => {
      $.getJSON(SortyConfiguration.sourceCollection, renderCollection);
    });
  }
}*/

Actions = {
  loadIIIFResource(manifest) {
    IIIF.wrap(manifest);
    manifestStore.dispatch(setManifestData(manifest));
    getCreatedManifests();
    if (!manifest.mediaSequences) {
      manifestStore.dispatch(setCanvases(manifest.sequences[0].canvases));
      thumbsUpdate();
    }
  },
  ajaxLoadManifest() {
    DOM.$html.removeClass('dm-loaded');
    DOM.$html.removeClass('manifest-loaded');
    $('.workspace-tabs__link[data-modifier="all"]').click();
    store.dispatch(clearSelection());
    store.dispatch(resetDerivedManifests());
    const inputState = manifestStore.getState();

    if (typeof inputState.manifest !== 'undefined' && inputState.manifest !== null) {
      if (typeof history !== 'undefined') {
        history.replaceState(null, null, `classify.html?manifest=${inputState.manifest}`);
      }
      DOM.$manifestInputFeedback.text(`Loading '${inputState.manifest}'...`);
      store.dispatch(setLoading(true));
      IIIFActions.loadManifest(
        inputState.manifest,
        Events.manifestLoadSuccess,
        Events.manifestLoadError
      );
    }
  },
  processQueryStringFromInput(url) {
    // console.log('pqsfi[', url, ']');
    if (url !== '') {
      const qs = /manifest=(.*)/g.exec(url);
      // console.log('qs', qs);
      if (qs && qs[1]) {
        // console.log('pqsfi');
        manifestStore.dispatch(setManifest(decodeURIComponent(qs[1].replace(/%2b/g, '%20'))));
        Actions.ajaxLoadManifest();
      }
    }
  },
};

Events = {
  domReady() {
    // Get DOM elements
    DOM.init();
    // Process query string for manifests
    Actions.processQueryStringFromInput(window.location.search);
    // Hook up load button event
    DOM.$manifestInputLoad.click(Events.loadManifestClick);
  },
  loadManifestClick(e) {
    e.preventDefault();
    manifestStore.dispatch(setManifest(DOM.$manifestInput.val()));
    Actions.ajaxLoadManifest();
  },
  manifestLoadError(data) {
    alert(`Error: ${data.statusText}`);
    store.dispatch(setLoading(false));
  },
  manifestLoadSuccess(iiifResource) {
    // console.log('manifestLoadSuccess', iiifResource);
    DOM.$manifestInputFeedback.text(`Current manifest: '${iiifResource['@id']}'`);
    store.dispatch(setLoading(false));
    if (iiifResource['@type'] === 'sc:Collection') {
      // TODO - collections
    } else {
      Actions.loadIIIFResource(iiifResource);
    }
  },
  manifestStoreSubscribe() {
    // console.log('IN - subscribe', lastLocalState, store.getState().input);
    const loadedManifestState = manifestStore.getState();

    if (hasPropertyChanged('manifest', loadedManifestState, lastLocalLoadedManifestState)) {
      DOM.$manifestInput.val(loadedManifestState.manifest);
    }

    lastLocalLoadedManifestState = loadedManifestState;
  },
  storeSubscribe() {
    const state = store.getState().ui;
    // console.log('input store subscribe', state.loadingManifest,
    // hasPropertyChanged('loadingManifest', state, lastLocalState));
    if (DOM.$manifestInputContainer !== null
      && hasPropertyChanged('loadingManifest', state, lastLocalState)) {
      if (state.loadingManifest) {
        DOM.$manifestInputContainer.addClass('manifest-input--loading');
        DOM.$html.addClass('loading-manifest');
      } else {
        DOM.$manifestInputContainer.removeClass('manifest-input--loading');
        DOM.$html.removeClass('loading-manifest');
      }
    }
    lastLocalState = state;
  },
};

export const inputInit = (globalStore, globalManifestStore) => {
  store = globalStore;
  manifestStore = globalManifestStore;
  // Subscribe to store changes
  manifestStore.subscribe(Events.manifestStoreSubscribe);
  store.subscribe(Events.storeSubscribe);
  $(document).ready(Events.domReady);
};
