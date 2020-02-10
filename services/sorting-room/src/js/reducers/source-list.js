import {
  SET_SOURCE_MANIFESTS,
} from '../actions/source-list.js';

const initialState = {
  sourceManifests: null,
};

export const sourceList = (state = initialState, action) => {
  switch (action.type) {
    case SET_SOURCE_MANIFESTS: {
      return Object.assign({}, state, { sourceManifests: action.sourceManifests });
    }
    default: return state;
  }
};
