
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
} from '../actions/auth';
import { hasValidToken, setUserToken, removeUserToken } from '../helpers/jwt';

export const auth = (state = {
  isFetching: false,
  isAuthenticated: hasValidToken(),
}, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return Object.assign({}, state, {
        isFetching: true,
        isAuthenticated: false,
      });
    case LOGIN_SUCCESS:
      setUserToken(action.user.id_token);
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: true,
        errorMessage: undefined,
      });
    case LOGIN_FAILURE:
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
        errorMessage: action.message,
      });
    case LOGOUT:
      removeUserToken();
      return Object.assign({}, state, {
        isFetching: false,
        isAuthenticated: false,
      });
    default:
      return state;
  }
};
