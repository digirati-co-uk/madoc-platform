const $ = require('jquery');
import { SortyConfiguration } from '../config/config';
import { getUserToken } from '../helpers/jwt';

export const IIIFActions = {};

IIIFActions.postCollection = (manifest, collectionURI, url, success, error) => {
  const newManifestInstance = Object.assign({}, manifest);
  console.log('IIIFActions.postCollection url', url);
  var toPost = {
    '@id':newManifestInstance['@id'],
    '@type':newManifestInstance['@type'],
    'label':newManifestInstance['label'],
  };

  debugger;
  $.ajax({
    url,
    type: 'POST',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify({
      '@id': collectionURI,
      collection_data: toPost,
    }),
    beforeSend: function(xhr) {
      // xhr.setRequestHeader('Authorization', 'Bearer ' + getUserToken());
    },
    dataType: 'json',
    error,
    success,
  });
};


IIIFActions.addManifestToCollection = (collectionUrl, label, canvasIds) => {
  const url = `${collectionUrl}/manifest`;
  const body = {label, canvasIds};

  return new Promise((resolve, reject) => {
    $.ajax({
      url,
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(body),
      beforeSend: function (xhr) {
        console.log(getUserToken());
        xhr.setRequestHeader('Authorization', 'Bearer ' + getUserToken());
      },
      dataType: 'json',
      error: reject,
      success: resolve,
    });
  });
};

IIIFActions.addUpdateManifest = (manifest, success, error) => {
  console.log('IIIFActions.addUpdateManifest url', SortyConfiguration.getManifestUrlAdd());
  debugger;
  $.ajax({
    url: SortyConfiguration.getManifestUrlAdd(),
    type: 'POST',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(manifest),
    beforeSend: function(xhr) {
      // xhr.setRequestHeader('Authorization', 'Bearer ' + getUserToken());
    },
    dataType: 'json',
    error,
    success,
  });
};
//
// IIIFActions.deleteManifest = (uri, success, error) => {
//   console.log('IIIFActions.deleteManifest uri', uri);
//   // TODO: url is temporary, John and I agreed that the
//   // manifest parameter will be in the POST payload (JSON)
//   debugger;
//   $.ajax({
//     url: `${SortyConfiguration.getManifestDeleteUrl()}?manifest=${uri}`,
//     type: 'POST',
//     beforeSend: function(xhr) {
//       // xhr.setRequestHeader('Authorization', 'Bearer ' + getUserToken());
//     },
//     error,
//     success,
//   });
// };

IIIFActions.loadManifest = (url, success, error) => {
  console.log('IIIFActions.loadManifest url', url);
  $.ajax({
    dataType: 'json',
    url,
    cache: true,
    beforeSend: function(xhr) {
      // xhr.setRequestHeader('Authorization', 'Bearer ' + getUserToken());
    },
    error,
    success,
  });
};
