import { SortyConfiguration } from '../config/config.js';
import {getUserToken} from "../helpers/jwt";
const $ = require('jquery');

export const OmekaActions = {};

// Used by the omeka service block
export const omekaServiceProfile = 'https://dlcs.info/omeka/';

// OmekaActions.pushToOmeka = (url, accessToken) => {
//
//   // Combine auth and url
//   const data = { resourceUrl: url };
//
//   // API only takes uri encoded data for now...
//   let uriEncodedData = [];
//   for (const key of Object.keys(data)) {
//     uriEncodedData.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`);
//   }
//   uriEncodedData = uriEncodedData.join('&');
//
//   return $.ajax({
//     url: SortyConfiguration.omekaImportEndpoint,
//     type: 'POST',
//     beforeSend: function(xhr) {
//       xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
//     },
//     crossDomain: true,
//     data: uriEncodedData,
//   });
// };

// OmekaActions.addOmekaService = (manifestUrl) => {
//   console.log('addOmekaService called', manifestUrl);
//
//   // Placeholder service values - to replace
//   const omekaServiceContext = 'https://dlcs.info/omeka/context.json';
//   const omekaServiceId = 'omekaId';
//   const serviceUrl = `${manifestUrl}/iiif/services/`;
//   const envelope = `
//   {
//    "@id": "${manifestUrl}",
//    "@type": "sc:Manifest",
//    "service": {
//      "@context": "${omekaServiceContext}",
//      "@id": "${omekaServiceId}",
//      "profile": "${omekaServiceProfile}"
//    }
//   }`;
//   return $.ajax({
//     url: serviceUrl,
//     type: 'POST',
//     crossDomain: true,
//     contentType: 'application/json; charset=utf-8',
//     dataType: 'json',
//     data: envelope,
//   });
// };
