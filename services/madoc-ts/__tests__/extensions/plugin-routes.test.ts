import React from 'react';
import type { RouteObject } from 'react-router-dom';
import { PluginManager, PluginModule } from '../../src/frontend/shared/plugins/plugin-manager';
import { createPluginWrapperFromElement } from '../../src/frontend/shared/plugins/create-plugin-wrapper';

jest.mock('../../src/extensions/page-blocks/extension', () => ({ PageBlockExtension: {} }));
jest.mock('../../src/extensions/project-export/extension', () => ({ ProjectExportExtension: {} }));
jest.mock('../../src/extensions/projects/extension', () => ({ ProjectTemplateExtension: {} }));
jest.mock('../../src/extensions/themes/extension', () => ({ ThemeExtension: {} }));
jest.mock('../../src/frontend/shared/plugins/create-plugin-wrapper', () => ({
  createPluginWrapperFromElement: jest.fn((element: React.ReactNode, name: string) =>
    React.createElement('section', { 'data-plugin': name }, element)
  ),
}));

test('repeated route hooks copy shared plugin routes, preserving original elements and plugin order', () => {
  const originalElement = React.createElement('article');
  const sharedRoute: RouteObject = Object.freeze({ path: '/plugin', element: originalElement });
  const plugins: PluginModule[] = ['first', 'second', 'other-site'].map((id, index) => ({
    siteId: index === 2 ? 2 : 1,
    definition: {
      id,
      name: id,
      installed: true,
      enabled: true,
      repository: { owner: 'test', name: id },
      version: '1.0.0',
      development: { enabled: false },
    },
    module: { id, hookRoutes: () => [sharedRoute] },
  }));
  const manager = new PluginManager(plugins);
  const baseRoute: RouteObject = { path: '/base' };
  for (let render = 0; render < 2; render++) {
    const routes = manager.hookRoutes([baseRoute], {}, 1);
    expect(routes[0]).toBe(baseRoute);
    expect(routes).toHaveLength(3);
    expect(routes[1]).not.toBe(sharedRoute);
    expect(routes[2]).not.toBe(sharedRoute);
    expect(sharedRoute.element).toBe(originalElement);
  }
  expect(createPluginWrapperFromElement).toHaveBeenCalledTimes(4);
  expect(createPluginWrapperFromElement).toHaveBeenNthCalledWith(1, originalElement, 'first');
  expect(createPluginWrapperFromElement).toHaveBeenNthCalledWith(2, originalElement, 'second');
  expect(createPluginWrapperFromElement).toHaveBeenNthCalledWith(3, originalElement, 'first');
  expect(createPluginWrapperFromElement).toHaveBeenNthCalledWith(4, originalElement, 'second');
});
