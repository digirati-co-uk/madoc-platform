import { renderClient } from '../shared/utility/render-client';
import '../shared/plugins/globals';

Promise.all([
  // The component.
  import('./index'),
  // The routes themselves.
  import('./routes'),
  // And the components
  import('./components'),
]).then(async ([mod, routes, components]) => {
  // For plugins, I'm expecting this is where they would be detected and loaded.
  // - Get array of plugins
  // - Run hooks for routes and components
  // - Pass modified parts to render client.
  // - The config for a site will tell us:
  //    - Plugins to load
  //    - Config for those plugins
  //    - Theme configuration
  // - This will be picked up in a script tag for the SSR in some way.
  // - A plugin could in theory be a remote URL too, and have some fancy server-side caching
  //   of them.
  await renderClient(mod.default, routes.createRoutes, components, false);
});
