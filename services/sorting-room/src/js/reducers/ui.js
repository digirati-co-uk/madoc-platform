import {
  HIDE_LIGHTBOX,
  SET_CURRENT_IMAGE,
  SET_LOADING_MANIFEST,
  SET_TAB,
  SET_THUMB_SIZE,
  SHOW_LIGHTBOX,
  TOGGLE_HELP_VISIBLE,
} from '../actions/ui.js';

const initialState = {
  activeTab: null,
  helpVisible: false,
  lightbox: {
    currentImage: null,
    index: null,
    visible: false,
  },
  loadingManifest: false,
  thumbSize: null,
};

export const ui = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENT_IMAGE: {
      const lightbox = Object.assign({}, state.lightbox, { currentImage: action.currentImage });
      return Object.assign({}, state, { lightbox });
    }
    case SET_TAB: {
      return Object.assign({}, state, { activeTab: action.tab });
    }
    case SHOW_LIGHTBOX: {
      const lightbox = Object.assign({}, state.lightbox, { index: action.index, visible: true });
      return Object.assign({}, state, { lightbox });
    }
    case HIDE_LIGHTBOX: {
      const lightbox = Object.assign({}, state.lightbox, { index: null, visible: false });
      return Object.assign({}, state, { lightbox });
    }
    case SET_LOADING_MANIFEST: {
      return Object.assign({}, state, { loadingManifest: action.loading });
    }
    case SET_THUMB_SIZE: {
      return Object.assign({}, state, { thumbSize: action.thumbSize });
    }
    case TOGGLE_HELP_VISIBLE: {
      return Object.assign({}, state, { helpVisible: !state.helpVisible });
    }
    default: return state;
  }
};
