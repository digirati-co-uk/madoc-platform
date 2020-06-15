import { renderClient } from '../shared/utility/render-client';

Promise.all([
  // The component.
  import('./index'),
  // The routes themselves.
  import('./routes'),
]).then(([mod, routes]) => {
  renderClient(mod.default, routes.routes);
});
