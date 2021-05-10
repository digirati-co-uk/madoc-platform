import { MyTestBlock } from './blocks/MyTestBlock';
import { TestPluginPage } from './test-plugin-page';
import { ListCollectionsReplacement } from './list-collection-replacement';

export const metadata = {
  title: 'My plugin',
  version: 'v1.0.0',
  repository: 'https://...',
};

export function hookRoutes() {
  return [
    {
      path: '/test-plugin',
      component: TestPluginPage,
      exact: true,
    },
  ];
}

export function hookComponents() {
  return {
    AllCollections: ListCollectionsReplacement,
  };
}

export function hookBlocks() {
  return {
    MyTestBlock,
  };
}
