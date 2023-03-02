import('./_common.mjs').then(common => {
  common.loadBundle('../dist/scheduler/bundle.es.js', 'scheduler');
}).catch(e => {throw e});

