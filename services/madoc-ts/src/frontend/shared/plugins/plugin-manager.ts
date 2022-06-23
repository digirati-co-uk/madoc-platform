import { RouteObject } from 'react-router-dom';
import { PageBlockExtension } from '../../../extensions/page-blocks/extension';
import { ProjectTemplateExtension } from '../../../extensions/projects/extension';
import { ThemeExtension } from '../../../extensions/themes/extension';
import { ModuleWrapper } from '../../../types/plugins';
import { SitePlugin } from '../../../types/schemas/plugins';
import { RouteComponents } from '../../site/routes';
import { captureModelShorthand } from '../capture-models/helpers/capture-model-shorthand';
import { createPluginWrapper, createPluginWrapperFromElement } from './create-plugin-wrapper';

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
      this.registerProjectTemplates(plugin);
      this.registerThemes(plugin);
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
          PageBlockExtension.removePlugin({
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
          PageBlockExtension.registerPlugin({
            pluginId: plugin.definition.id,
            siteId: plugin.definition.siteId,
            definition: (block as any).modelShorthand
              ? {
                  ...block,
                  model: this.ensureFullModelDocument((block as any).modelShorthand),
                  source: { id: plugin.definition.id, name: plugin.definition.name, type: 'plugin' },
                }
              : { ...block, source: { id: plugin.definition.id, name: plugin.definition.name, type: 'plugin' } },
          });
        }
      }
    }
  }

  registerThemes(plugin: PluginModule) {
    if (plugin.module.themes) {
      for (const theme of plugin.module.themes) {
        ThemeExtension.registerPlugin({
          pluginId: plugin.definition.id,
          siteId: plugin.siteId,
          definition: {
            id: `${plugin.definition.id}::${theme.id}`,
            type: `${plugin.definition.id}::${theme.id}`,
            source: { id: plugin.definition.id, name: plugin.definition.name, type: 'plugin' },
            config: theme,
          },
        });
      }
    }
  }

  unregisterThemes(plugin: PluginModule) {
    if (plugin.module.themes) {
      for (const theme of plugin.module.themes) {
        ThemeExtension.removePlugin({
          pluginId: plugin.definition.id,
          siteId: plugin.siteId,
          type: `${plugin.definition.id}::${theme.id}`,
        });
      }
    }
  }

  registerProjectTemplates(plugin: PluginModule) {
    if (plugin.module.projectTemplates) {
      for (const projectTemplate of plugin.module.projectTemplates) {
        ProjectTemplateExtension.registerPlugin({
          pluginId: plugin.definition.id,
          siteId: plugin.siteId,
          definition: {
            ...projectTemplate,
            source: { id: plugin.definition.id, name: plugin.definition.name, type: 'plugin' },
          },
        });
      }
    }
  }

  unregisterProjectTemplates(plugin: PluginModule) {
    if (plugin.module.projectTemplates) {
      for (const projectTemplate of plugin.module.projectTemplates) {
        ProjectTemplateExtension.removePlugin({
          pluginId: plugin.definition.id,
          siteId: plugin.siteId,
          type: projectTemplate.type,
        });
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
      this.unregisterProjectTemplates(found);
      this.unregisterThemes(found);
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
    this.registerProjectTemplates(newPlugin);
    this.registerThemes(newPlugin);
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
      this.registerProjectTemplates(this.plugins[idx]);
      this.registerThemes(this.plugins[idx]);
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
        children: [...newRoutes, routeComponents.fallback],
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

  hookRoutes(routes: RouteObject[], components: any, siteId: number) {
    const newRoutes = [...routes];
    for (const plugin of this.plugins) {
      if (plugin.module.hookRoutes && plugin.siteId === siteId) {
        const hooked = plugin.module.hookRoutes(routes, components);
        for (const hookedRoute of hooked) {
          if (hookedRoute.element) {
            hookedRoute.element = createPluginWrapperFromElement(hookedRoute.element, plugin.definition.name);
          }
        }
        newRoutes.push(...hooked);
      }
    }

    return newRoutes;
  }
}
