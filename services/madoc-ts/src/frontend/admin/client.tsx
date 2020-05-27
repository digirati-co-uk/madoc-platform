import { renderClient } from '../shared/utils/render-client';

import('./index').then(mod => {
  renderClient(mod.default);
});
