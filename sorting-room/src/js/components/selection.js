import { hasPropertyChanged } from '../helpers/helpers.js';
import {
  addOrRemoveFromSelection,
  selectImage,
  selectImageRange,
  clearSelection,
} from '../actions/selected-collection.js';
import {
  attachLightboxBehaviour,
} from './lightbox';

const $ = require('jquery');

let store = null;
let manifestStore = null;

let lastLocalSelectedCollectionState = null;
let lastLocalLoadedManifestState = null;

const clearSelectionButton = '.classify-tools__clear';

const Events = {
  contextMenu(e) {
    const $target = $(e.target);
    // console.log(e, $target);
    if (($target.hasClass('thumb') || $target.hasClass('tc')) && e.ctrlKey) {
      const idx = $target.attr('data-idx');
      // console.log(idx);
      store.dispatch(addOrRemoveFromSelection(idx));
      e.preventDefault();
    }
  },
  clearSelectionClick() {
    store.dispatch(clearSelection());
  },
  domReady() {
    $(clearSelectionButton).click(Events.clearSelectionClick);
    $(document).on('contextmenu', Events.contextMenu);
  },
  manifestStoreSubscribe() {
    const loadedManifestState = manifestStore.getState();
    if (hasPropertyChanged('manifestTitle', loadedManifestState, lastLocalLoadedManifestState)) {
      // console.log(loadedManifestState.manifestTitle);
    }
    lastLocalLoadedManifestState = loadedManifestState;
  },
  storeSubscribe() {
    const selectedCollectionState = store.getState().selectedCollection;
    if (hasPropertyChanged('selectedImages', selectedCollectionState,
    lastLocalSelectedCollectionState)) {
      // console.log('SEL - changed');
      const $thumbActive = $('.thumb--active');
      const selectedImages = selectedCollectionState.selectedImages;

      $thumbActive.removeClass('thumb--active');

      if (selectedImages.length) {
        for (const idx of selectedImages) {
          $(`.thumb:eq(${idx})`).addClass('thumb--active');
        }
      }
    }
    lastLocalSelectedCollectionState = selectedCollectionState;
  },
  thumbClick(e) {
    const idx = $(this).attr('data-idx');
    if (e.shiftKey) {
      store.dispatch(selectImageRange(idx));
    } else {
      store.dispatch(selectImage(idx));
    }
    e.stopPropagation();
  },
};

export const attachSelectionBehaviour = () => {
  const $thumb = $('img.thumb');
  $thumb.click(Events.thumbClick);
  attachLightboxBehaviour();
  $thumb.unveil(300);
};

export const selectionInit = (globalStore, globalManifestStore) => {
  store = globalStore;
  manifestStore = globalManifestStore;
  $(document).ready(Events.domReady);
  store.subscribe(Events.storeSubscribe);
  manifestStore.subscribe(Events.manifestStoreSubscribe);
};
