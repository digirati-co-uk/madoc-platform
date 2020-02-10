import {
  RESET_DERIVED_MANIFESTS,
  SET_ALL_IMAGES,
  SET_CANVASES,
  SET_CLASSIFIED_CANVASES,
  SET_DERIVED_MANIFESTS,
  SET_DERIVED_MANIFESTS_COMPLETE,
  SET_MANIFEST,
  SET_MANIFEST_DATA,
  SET_THUMB_SIZES,
} from '../actions/loaded-manifest.js';

const initialState = {
  manifest: null,
  manifestData: null,
  // All images with additional data
  allImages: [],
  // Canvases with limited data
  canvases: null,
  classifiedCanvases: new Set(),
  derivedManifests: null,
  derivedManifestsComplete: new Set(),
  thumbSizes: null,
};

export const loadedManifest = (state = initialState, action) => {
  switch (action.type) {
    case SET_MANIFEST: {
      return Object.assign({}, state, { manifest: action.manifest });
    }
    case SET_MANIFEST_DATA: {
      return Object.assign({}, state, { manifestData: action.manifestData });
    }
    case SET_ALL_IMAGES: {
      return Object.assign({}, state, { allImages: action.allImages });
    }
    case SET_CANVASES: {
      return Object.assign({}, state, { canvases: action.canvases });
    }
    case SET_DERIVED_MANIFESTS: {
      return Object.assign({}, state, {
        derivedManifests: action.derivedManifests,
      });
    }
    case RESET_DERIVED_MANIFESTS: {
      return Object.assign({}, state, {
        derivedManifests: initialState.derivedManifests,
      });
    }
    case SET_DERIVED_MANIFESTS_COMPLETE: {
      return Object.assign({}, state, {
        derivedManifestsComplete: action.derivedManifestsComplete,
      });
    }
    case SET_CLASSIFIED_CANVASES: {
      return Object.assign({}, state, {
        classifiedCanvases: action.classifiedCanvases,
      });
    }
    case SET_THUMB_SIZES: {
      return Object.assign({}, state, {
        thumbSizes: action.thumbSizes,
      });
    }
    default: return state;
  }
};
