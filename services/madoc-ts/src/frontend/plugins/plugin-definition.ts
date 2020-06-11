import { UniversalRoute } from '../types';

export type PluginDefinition<RouteComponents> = {
  hookRoutes(routes: UniversalRoute[]): void;
  hookComponents(components: RouteComponents): RouteComponents;
};
