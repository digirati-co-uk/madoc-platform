import { UniversalRoute } from '../types';

type BaseRouteComponents = typeof import('./components');
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RouteComponents extends BaseRouteComponents {}

export function createRoutes(components: RouteComponents): UniversalRoute[] {
  // const components = hookComponents(inputComponents);

  const routes = [
  ];

  // hookRoutes(routes);

  return routes;
}
