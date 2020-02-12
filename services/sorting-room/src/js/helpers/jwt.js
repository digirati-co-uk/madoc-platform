import {SortyConfiguration} from "../config/config";
const $ = require('jquery');

function parseJwt(token) {
  return token;
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
}

function isStillValid(token) {
  return true;
  const expEpoch = parseJwt(token).exp * 1000;
  const epoch = new Date().getTime();
  return epoch < expEpoch;
}

function getUserToken() {
  return localStorage.getItem('id_token');
}

export function checkLogin() {
  return new Promise((success, error) => {
    $.ajax(`${SortyConfiguration.oauthSiteEndpoint}/auth/me`, {
      type: 'POST',
      crossDomain: true,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + getUserToken());
      },
      success,
      error,
    });
  });
}

function hasValidToken() {

  const token = getUserToken();
  return !!(token && isStillValid(token));
}

function setUserToken(token) {
  localStorage.setItem('id_token', token);
}

function removeUserToken() {
  localStorage.removeItem('id_token');
}

export {
  parseJwt,
  isStillValid,
  getUserToken,
  hasValidToken,
  setUserToken,
  removeUserToken,
};
