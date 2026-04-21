import { renderClient } from '../shared/utility/render-client';
import '../shared/plugins/globals';
import 'react-tooltip/dist/react-tooltip.css';

Promise.all([
  // The component.
  import('./index'),
  // The routes themselves.
  import('./routes'),
]).then(async ([mod, routes]) => {
  await renderClient(mod.default, routes.routes, {}, false);

  if (process.env.NODE_ENV !== 'production') {
    document.body.classList.remove('dev-loading');
  }
});
