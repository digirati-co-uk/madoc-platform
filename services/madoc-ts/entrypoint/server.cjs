import('./_common.mjs').then(common => {
  common.loadBundle('../dist/server/bundle.es.js', 'server');
}).catch(e => {throw e});

