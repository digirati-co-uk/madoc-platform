export const SELECT = 'SELECT';
export const SELECT_IMAGE_RANGE = 'SELECT_IMAGE_RANGE';
export const ADD_OR_REMOVE_FROM_SELECTION = 'ADD_OR_REMOVE_FROM_SELECTION';
export const REPLACE_SELECTION = 'REPLACE_SELECTION';
export const CLEAR_SELECTION = 'CLEAR_SELECTION';
export const SET_COLLECTION_NAME = 'SET_COLLECTION_NAME';
export const SET_COLLECTION_MANIFEST = 'SET_COLLECTION_MANIFEST';

/* Action Creators */
export const selectImage = (idx) => ({
  type: SELECT,
  currentImage: parseInt(idx, 10),
});

export const selectImageRange = (idx) => ({
  type: SELECT_IMAGE_RANGE,
  selectTo: parseInt(idx, 10),
});

export const addOrRemoveFromSelection = (idx) => ({
  type: ADD_OR_REMOVE_FROM_SELECTION,
  addOrRemoveFromSelection: parseInt(idx, 10),
});

export const replaceSelection = (selection) => ({
  type: REPLACE_SELECTION,
  selection,
});

export const clearSelection = () => ({
  type: CLEAR_SELECTION,
});

export const setCollectionName = (collectionName) => ({
  type: SET_COLLECTION_NAME,
  collectionName,
});

export const setCollectionManifest = (collectionManifest) => ({
  type: SET_COLLECTION_MANIFEST,
  collectionManifest,
});
