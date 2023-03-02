import('./_common.mjs').then(common => {
  common.loadBundle('../dist/producer/bundle.es.js', 'queue');
}).catch(e => {throw e});

