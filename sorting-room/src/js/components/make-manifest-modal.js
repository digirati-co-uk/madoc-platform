// Sorty config
import {
  SortyConfiguration,
} from '../config/config.js';
import {
  getTerm,
} from '../config/terms.js';

// IIIF helpers
import {
  IIIF,
} from '../helpers/iiif.js';

import {
 IIIFActions,
} from './iiif-actions.js';

import {
  clearSelection,
  setCollectionName,
  setCollectionManifest,
} from '../actions/selected-collection.js';

import {
  getCreatedManifests,
} from '../components/derived-manifests.js';

import {
  switchView,
} from '../components/workspace.js';

import {
  resetDerivedManifests,
} from '../actions/loaded-manifest.js';

const $ = require('jquery');

let store = null;
let manifestStore = null;

const DOM = {
  init() {
    DOM.$html = $('html');
    DOM.$makeManifestButton = $('.classify-tools__make');
    DOM.$manifestModalHeading = $('.manifest-modal--make .manifest-modal__heading');
    DOM.$manifestModalInput = $('.manifest-modal__input');
    DOM.$manifestModalSavingText = $('.manifest-modal__saving-text');
    DOM.$modalCancel = $('.manifest-modal__dismiss');
    DOM.$modalMakeManifest = $('.manifest-modal__make');
    DOM.$savedCollection = $('.saved__collection');
    DOM.$savedFeedback = $('.saved__feedback');
    DOM.$savedProgress = $('.saved__progress-bar');
    DOM.$viewer = $('.viewer');
  },
};

const Config = {
  manifestTemplate: {
    '@context': 'http://iiif.io/api/presentation/2/context.json',
    '@id': 'to be replaced',
    '@type': 'sc:Manifest',
    label: 'to be replaced',
    sequences: [
      {
        '@id': 'to be replaced',
        '@type': 'sc:Sequence',
        label: 'Default sequence',
        canvases: [],
      },
    ],
  },
  canvasMapTemplate: {
    '@id': 'to be replaced',
    '@context': 'https://dlcs.info/context/presley',
    profile: 'https://dlcs.info/profiles/canvasmap',
    canvasMap: {},
  },
  makeManifestModalOptions: {
    callbacks: {
      beforeOpen() {
        DOM.$html.addClass('mfp-modal');
        const state = store.getState();
        const manifestState = manifestStore.getState();
        const manifest = manifestState.manifest;
        const selectedImages = state.selectedCollection.selectedImages;
        const s = Math.min.apply(Math, selectedImages);
        const e = Math.max.apply(Math, selectedImages);
        const label = store.getState().selectedCollection.collectionName !== null
        && store.getState().selectedCollection.collectionName !== '' ?
        store.getState().selectedCollection.collectionName :
        SortyConfiguration.getManifestLabel(manifest, s, e).trim();
        DOM.$manifestModalInput.val(label);
      },
      beforeClose() {
        DOM.$html.removeClass('mfp-modal');
      },
    },
    items: {
      src: '#manifestmodal',
      type: 'inline',
    },
    modal: true,
  },
};

const setSavingState = (saving) => {
  if (saving) {
    $('html').addClass('saving-manifest');
    $('.manifest-modal__input').attr('readonly');
  } else {
    $('html').removeClass('saving-manifest');
  }
};

const Events = {
  domReady() {
    DOM.init();
    DOM.$modalCancel.click(Events.modalCancel);
    DOM.$modalMakeManifest.click(Events.modalMakeManifest);
    DOM.$makeManifestButton.magnificPopup(Config.makeManifestModalOptions);

    // Set terms
    DOM.$manifestModalHeading.html(`Give your ${getTerm('derivedManifest', 0)} a label?`);
    DOM.$manifestModalSavingText.html(`Saving your ${getTerm('derivedManifest', 0)}`);
  },
  modalCancel() {
    $.magnificPopup.close();
  },
  modalMakeManifest() {
    const state = store.getState();
    const manifestState = manifestStore.getState();
    const selectedImages = state.selectedCollection.selectedImages;
    const manifest = manifestState.manifest;
    const canvases = manifestState.canvases;
    const s = Math.min.apply(Math, selectedImages);
    const e = Math.max.apply(Math, selectedImages);

    setSavingState(true);

    const label = DOM.$manifestModalInput.val();
    const canvasIds = selectedImages.map(idx => canvases[idx]).map(canvas => canvas['@id']);
    const collectionUrl = SortyConfiguration.getCollectionUri(manifest);

    IIIFActions.addManifestToCollection(collectionUrl, label, canvasIds).then((resp) => {
      store.dispatch(setCollectionManifest(resp));
      Events.postSuccess();
    }).catch((err) => {

      console.log(err);
    });
  },
  postManifest(newManifest) {
    throw new Error('is this called?');
    IIIFActions.postCollection(newManifest,
      SortyConfiguration.getCollectionUri(manifestStore.getState().manifest),
      SortyConfiguration.getCollectionAddUrl(),
      Events.postComplete,
      Events.postError);
  },
  postError(xhr, textStatus, error) {
    alert(error);
  },
  postSuccess() {
    // Remove loader
    setSavingState(false);

    // Grab active thumbs
    const $activeThumbs = $('.thumb--active');
    const collectionName = store.getState().selectedCollection.collectionName;

    // Update preview title
    const savedFeedbackHtml = `
      <i class="material-icons">done</i> Your new set "${collectionName}" is saved.
      <span><a class="saved__make-set" href="#">Start another set</a>, or
      <a class="saved__view-sets" href="#">view all the sets</a> ?</span>`;
    DOM.$savedFeedback.html(savedFeedbackHtml);
    DOM.$savedFeedback.find('.saved__make-set').click(Events.savedMakeSetClick);
    DOM.$savedFeedback.find('.saved__view-sets').click(Events.savedViewSetsClick);

    // Clone thumbs for preview
    const $activeThumbsClone = $activeThumbs.parent().clone();
    $activeThumbsClone.find('.thumb--active').removeClass('thumb--active');

    // Display them as a preview
    DOM.$savedCollection.empty().append($activeThumbsClone);
    switchView('saved');

    // Close the modal
    $.magnificPopup.close();

    // Update the progress bar's initial value
    const manifestState = manifestStore.getState();
    const classifiedTotal = manifestState.classifiedCanvases.size;
    const total = manifestState.allImages.length;
    const progressVal = total > 0 ? Math.round((classifiedTotal / total) * 100) : 0;
    DOM.$savedProgress.val(progressVal);

    // Give them the --classified class
    $activeThumbs.parent().addClass('tc--classified');
    $activeThumbs.removeClass('thumb--active');

    // Clear selection
    store.dispatch(clearSelection());
    store.dispatch(setCollectionName(''));

    // Push into derived manifests / derived manifests complete
    manifestStore.dispatch(resetDerivedManifests());
    getCreatedManifests();
  },
  putError(xhr, textStatus, error) {
    alert(error);
  },
  putSuccess() {
    const manifest = store.getState().selectedCollection.collectionManifest;
    const newManifestInstance = Object.assign({}, manifest);
    newManifestInstance.sequences = null;
    newManifestInstance.service = null;
    IIIFActions.postCollection(
      manifest,
      SortyConfiguration.getCollectionUri(manifestStore.getState().manifest),
      SortyConfiguration.getCollectionAddUrl(),
      Events.postSuccess,
      Events.postError
    );
  },
  savedMakeSetClick(e) {
    e.preventDefault();
    switchView('add');
  },
  savedViewSetsClick(e) {
    e.preventDefault();
    switchView('done');
  },
};

export const makeManifestInit = (globalStore, globalManifestStore) => {
  store = globalStore;
  manifestStore = globalManifestStore;
};

$(document).ready(Events.domReady);
