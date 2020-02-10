import {SortyConfiguration} from "../config/config";

const omekaAuthEndpoint = SortyConfiguration.oauthSiteEndpoint;
const clientId = SortyConfiguration.oauthClientId;
const redirect = SortyConfiguration.oauthCallback;
const omekaTokenStore = {current: null, expires: null, hasExpired: true};

function getOmekaToken() {
  if (!omekaTokenStore.hasExpired) {
    return Promise.resolve({accessToken: omekaTokenStore.current, expires: omekaTokenStore.expires});
  }

  return new Promise(function (resolve, reject) {
    const state = (new Date()).getTime();
    const authLogin = `${omekaAuthEndpoint}/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirect}&scope=import-iiif&state=${state}`;
    window.open(authLogin, 'callback');
    window.addEventListener('message', function (e) {
      if (e.data && e.data.state.toString() === state.toString() && e.data.code) {
        $.ajax(`${omekaAuthEndpoint}/auth/token`, {
          type: 'POST',
          crossDomain: true,
          contentType: 'application/json; charset=utf-8',
          dataType: 'json',
          data: JSON.stringify({
            grant_type: 'authorization_code',
            code: e.data.code,
            client_id: clientId,
          }),
          success: function ({access_token, expires_in}) {
            omekaTokenStore.current = access_token;
            omekaTokenStore.hasExpired = false;
            omekaTokenStore.expires = new Promise(r => setTimeout(() => {
              omekaTokenStore.hasExpired = true;
              r();
            }, expires_in * 1000));
            resolve({accessToken: omekaTokenStore.current, expires: omekaTokenStore.expires});
          },
          error: reject
        });
      } else {
        reject();
      }
    });
  });
}

export {
  getOmekaToken,

};
