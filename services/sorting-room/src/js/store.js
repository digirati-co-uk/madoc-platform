/* eslint-disable no-underscore-dangle */
import {applyMiddleware, compose, createStore} from "redux";
import reducers from "./reducers";
import thunk from "redux-thunk";
import {loadedManifest} from "./reducers/loaded-manifest";

export const store = createStore(reducers,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), compose(
    applyMiddleware(thunk)
  ));
export const manifestStore = createStore(loadedManifest,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), compose(
    applyMiddleware(thunk)
  ));
/* eslint-enable */
