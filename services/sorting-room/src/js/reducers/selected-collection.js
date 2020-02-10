import {
  ADD_OR_REMOVE_FROM_SELECTION,
  CLEAR_SELECTION,
  REPLACE_SELECTION,
  SELECT,
  SELECT_IMAGE_RANGE,
  SET_COLLECTION_NAME,
  SET_COLLECTION_MANIFEST,
} from '../actions/selected-collection.js';

const initialState = {
  collectionName: null,
  selectedImages: [],
  collectionManifest: null,
};

// Given a state, return array of index values based on start and end values
const selectImagesWithinRange = (start, end) => {
  const rangeSize = end - start + 1;
  const rangeCollection = [...Array(rangeSize).keys()].map(x => x + start);
  // Could optionally merge with existing values here
  return rangeCollection;
};

export const selectedCollection = (state = initialState, action) => {
  switch (action.type) {
    case SET_COLLECTION_MANIFEST: {
      return Object.assign({}, state, { collectionManifest: action.collectionManifest });
    }
    case SELECT: {
      let selectedImagesArray = state.selectedImages;
      // If not selected
      const currentImageArrayPosition = selectedImagesArray.indexOf(action.currentImage);
      selectedImagesArray = [];
      if (currentImageArrayPosition === -1) {
        selectedImagesArray.push(action.currentImage);
      }
      return Object.assign({}, state, {
        selectedImages: selectedImagesArray,
      });
    }
    case SELECT_IMAGE_RANGE: {
      let selectedImages = state.selectedImages;
      const min = Math.min.apply(Math, selectedImages);
      const max = Math.max.apply(Math, selectedImages);

      if (action.selectTo > min) {
        selectedImages = selectImagesWithinRange(min, action.selectTo);
      } else {
        selectedImages = selectImagesWithinRange(action.selectTo, max);
      }

      return Object.assign({}, state, { selectedImages });
    }
    case ADD_OR_REMOVE_FROM_SELECTION: {
      const selectedImages = state.selectedImages.slice(0);
      const currentImageArrayPosition = selectedImages.indexOf(action.addOrRemoveFromSelection);
      if (currentImageArrayPosition === -1) {
        selectedImages.push(action.addOrRemoveFromSelection);
      } else {
        selectedImages.splice(currentImageArrayPosition, 1);
      }
      return Object.assign({}, state, { selectedImages });
    }
    case REPLACE_SELECTION: {
      return Object.assign({}, state, { selectedImages: action.selection });
    }
    case CLEAR_SELECTION: {
      return Object.assign({}, state, { selectedImages: [] });
    }
    case SET_COLLECTION_NAME: {
      return Object.assign({}, state, { collectionName: action.collectionName });
    }
    default: return state;
  }
};
