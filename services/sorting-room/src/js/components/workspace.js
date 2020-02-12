import { attachMagnific } from './lightbox.js';

const $ = require('jquery');

const DOM = {
  $workspace: null,

  init() {
    DOM.$workspace = $('.viewer');
  },
};

export const switchView = (modifier) => {
  // Wipe out modifiers and set the new one
  const viewerClass = 'viewer';
  DOM.$workspace.attr('class', viewerClass).addClass(`${viewerClass}--${modifier}`);
  attachMagnific();
  $(window).trigger('lookup');
};

const Events = {
  domReady() {
    DOM.init();
  },
};

$(document).ready(Events.domReady);
