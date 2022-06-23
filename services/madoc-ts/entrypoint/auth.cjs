require('source-map-support').install({ environment: 'node', hookRequire: true });
import('./_common.mjs').then(common => {
  common.loadBundle('../dist/auth/bundle.es.js', 'auth');
}).catch(e => {throw e});

