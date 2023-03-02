import { renderClient } from '../shared/utility/render-client';
import { queryConfig } from './query-config';

Promise.all([
  // The component.
  import('./index'),
  // The routes themselves.
  import('./routes'),
]).then(async ([mod, routes]) => {
  await renderClient(mod.default, routes.routes, {}, true, queryConfig);

  if (process.env.NODE_ENV !== 'production') {
    document.body.classList.remove('dev-loading');
  }
});
