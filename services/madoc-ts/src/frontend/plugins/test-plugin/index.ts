import { UniversalRoute } from '../../types';
import { TestPluginPage } from './test-plugin-page';
import { RouteComponents } from '../../site/routes';
import { ListCollectionsReplacement } from './list-collection-replacement';

export function hookRoutes(routes: UniversalRoute[]) {
  routes.push({
    path: '/test-plugin',
    component: TestPluginPage,
    exact: true,
  });
}

export function hookComponents(components: RouteComponents) {
  return {
    ...components,
    AllCollections: ListCollectionsReplacement,
  };
}
