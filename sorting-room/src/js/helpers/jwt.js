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
