import { combineReducers } from 'redux';
// import { loadedManifest } from './loaded-manifest.js';
import { selectedCollection } from './selected-collection.js';
import { sourceList } from './source-list.js';
import { ui } from './ui.js';
import { auth } from './auth.js';

export default combineReducers({
  // loadedManifest,
  selectedCollection,
  sourceList,
  ui,
  auth,
});
