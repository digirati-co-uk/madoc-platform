import { captureModelShorthand } from '@capture-models/helpers';
import { reactBlockEmitter } from '../../../extensions/page-blocks/block-editor-react';
import { ModuleWrapper, SitePlugin } from '../../../types/schemas/plugins';
import { RouteComponents } from '../../site/routes';
import { UniversalRoute } from '../../types';
import { createPluginWrapper } from './create-plugin-wrapper';

export type PluginModule = {
  definition: SitePlugin;
  siteId: number;
  module: ModuleWrapper;
};

export class PluginManager {
  plugins: PluginModule[];

  constructor(plugins: PluginModule[]) {
    this.plugins = plugins;

    // Hook blocks.
    // @todo rethink.
    for (const plugin of this.plugins) {
      this.registerBlocks(plugin);
    }
  }

  ensureFullModelDocument(document: any) {
    if (!document || !document.properties || document.type !== 'entity') {
      return captureModelShorthand(document || {});
    }

    return document;
  }

  unregisterBlocks(plugin: PluginModule) {
    if (plugin.module.hookBlocks) {
      const newBlocks = plugin.module.hookBlocks();
      if (newBlocks) {
        const newBlockDefinitions = Object.values(newBlocks).map((r: any) => r[Symbol.for('slot-model')]);
        for (const block of newBlockDefinitions) {
          reactBlockEmitter.emit('remove-plugin-block', {
            pluginId: plugin.definition.id,
            siteId: plugin.definition.siteId,
            type: block.type,
          });
        }
      }
    }
  }

  registerBlocks(plugin: PluginModule) {
    if (plugin.module.hookBlocks) {
      const newBlocks = plugin.module.hookBlocks();
      if (newBlocks) {
        const newBlockDefinitions = Object.values(newBlocks).map((r: any) => r[Symbol.for('slot-model')]);
        for (const block of newBlockDefinitions) {
          reactBlockEmitter.emit('plugin-block', {
            pluginId: plugin.definition.id,
            siteId: plugin.definition.siteId,
            block: (block as any).modelShorthand
              ? {
                  ...block,
                  model: this.ensureFullModelDocument((block as any).modelShorthand),
                }
              : block,
          });
        }
      }
    }
  }

  listPlugins(siteId: number) {
    return this.plugins
      .filter(plugin => {
        return plugin.siteId === siteId;
      })
      .map(plugin => plugin.definition);
  }

  uninstallPlugin(pluginId: string, siteId?: number) {
    const allFound = this.plugins.filter(p => {
      if (!siteId) {
        return p.definition.id === pluginId;
      }
      return p.definition.id === pluginId && p.siteId === siteId;
    });
    for (const found of allFound) {
      const idx = this.plugins.indexOf(found);
      this.plugins = this.plugins.slice(0, idx).concat(this.plugins.slice(idx + 1));
      this.unregisterBlocks(found);
    }
  }

  installPlugin(newPlugin: PluginModule) {
    const found = this.plugins.find(p => p.definition.id === newPlugin.definition.id && p.siteId === newPlugin.siteId);
    if (found) {
      const idx = this.plugins.indexOf(found);
      this.plugins[idx].module = newPlugin.module;
      this.plugins[idx].definition = newPlugin.definition;
    } else {
      this.plugins.push(newPlugin);
    }
    this.registerBlocks(newPlugin);
  }

  updatePluginModule(id: string, module: any, siteId?: number, revision?: string) {
    const foundItems = this.plugins.filter(p => {
      if (p.definition.id === id) {
        if (!siteId) {
          return true;
        }

        return p.siteId === siteId;
      }

      return false;
    });
    for (const found of foundItems) {
      const idx = this.plugins.indexOf(found);
      // Skip if already set up for development.
      if (!siteId && this.plugins[idx].definition.development && this.plugins[idx].definition.development.enabled) {
        continue;
      }
      this.plugins[idx].module = module;
      this.registerBlocks(this.plugins[idx]);
      if (revision) {
        this.plugins[idx].definition.development = {
          enabled: true,
          revision,
        };
      }
    }
  }

  makeRoutes(routeComponents: any, siteId: number): RouteComponents[] {
    const newRoutes = this.hookRoutes(routeComponents.routes, routeComponents, siteId);

    return [
      {
        ...routeComponents.baseRoute,
        routes: [...newRoutes, routeComponents.fallback],
      },
    ];
  }

  hookComponents(components: any, siteId: number) {
    const returnComponents = { ...components };
    for (const plugin of this.plugins) {
      if (plugin.module.hookComponents && plugin.siteId === siteId) {
        const newComponents = plugin.module.hookComponents(components);
        const keys = Object.keys(newComponents);
        for (const key of keys) {
          returnComponents[key] = createPluginWrapper((newComponents as any)[key] as any, plugin.definition.name);
        }
      }
    }

    return returnComponents;
  }

  hookRoutes(routes: UniversalRoute[], components: any, siteId: number) {
    const newRoutes = [...routes];
    for (const plugin of this.plugins) {
      if (plugin.module.hookRoutes && plugin.siteId === siteId) {
        const hooked = plugin.module.hookRoutes(routes, components);
        for (const hookedRoute of hooked) {
          hookedRoute.component = createPluginWrapper(hookedRoute.component, plugin.definition.name);
        }
        newRoutes.push(...hooked);
      }
    }

    return newRoutes;
  }
}
