import { SortyConfiguration } from '../config/config.js';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT = 'LOGOUT';


export function loginRequest(creds) {
  return {
    type: LOGIN_REQUEST,
    creds,
  };
}

export function receiveLogin(data) {
  return {
    type: LOGIN_SUCCESS,
    user: {
      id_token: data.token,
    },
  };
}

export function loginError(message) {
  return {
    type: LOGIN_FAILURE,
    message,
  };
}

export function requestLogin(creds) {
  return (function requestLoginAsync(dispatch) {
    dispatch(loginRequest(creds));
    return fetch(SortyConfiguration.getLoginUrl(), {
      method: 'post',
      body: JSON.stringify(creds),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(response => {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      throw new TypeError('Malformed server response');
    }).then(data => {
      if (!data.msg) {
        dispatch(receiveLogin(data));
        SortyConfiguration.navigate.home();
        return;
      }
      throw new Error(data.msg);
    })
    .catch(err => {
      dispatch(loginError(err.message));
    });
  });
}

export function logout() {
  SortyConfiguration.navigate.login();
  return {
    type: LOGOUT,
  };
}
