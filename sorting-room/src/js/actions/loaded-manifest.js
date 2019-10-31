export const SET_ALL_IMAGES = 'SET_ALL_IMAGES';
export const SET_CANVASES = 'SET_CANVASES';
export const SET_DERIVED_MANIFESTS = 'SET_DERIVED_MANIFESTS';
export const RESET_DERIVED_MANIFESTS = 'RESET_DERIVED_MANIFESTS';
export const SET_DERIVED_MANIFESTS_COMPLETE = 'SET_DERIVED_MANIFESTS_COMPLETE';
export const SET_CLASSIFIED_CANVASES = 'SET_CLASSIFIED_CANVASES';
export const SET_MANIFEST = 'SET_MANIFEST';
export const SET_MANIFEST_DATA = 'SET_MANIFEST_DATA';
export const SET_THUMB_SIZES = 'SET_THUMB_SIZES';

/* Action Creators */
export const setManifest = (manifest) => ({
  type: SET_MANIFEST,
  manifest,
});

export const setManifestData = (manifestData) => ({
  type: SET_MANIFEST_DATA,
  manifestData,
});

export const setCanvases = (canvases) => ({
  type: SET_CANVASES,
  canvases,
});

export const setAllImages = (allImages) => ({
  type: SET_ALL_IMAGES,
  allImages,
});

export const setDerivedManifests = (derivedManifests) => ({
  type: SET_DERIVED_MANIFESTS,
  derivedManifests,
});

export const setDerivedManifestsComplete = (derivedManifestsComplete) => ({
  type: SET_DERIVED_MANIFESTS_COMPLETE,
  derivedManifestsComplete,
});

export const resetDerivedManifests = () => ({
  type: RESET_DERIVED_MANIFESTS,
});

export const setClassifiedCanvases = (classifiedCanvases) => ({
  type: SET_CLASSIFIED_CANVASES,
  classifiedCanvases,
});

export const setThumbSizes = (thumbSizes) => ({
  type: SET_THUMB_SIZES,
  thumbSizes,
});
