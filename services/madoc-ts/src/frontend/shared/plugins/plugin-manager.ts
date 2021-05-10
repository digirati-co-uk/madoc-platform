import React from 'react';
import { RouteComponents } from '../../site/routes';
import { UniversalRoute } from '../../types';
import { createPluginWrapper } from './create-plugin-wrapper';

type Plugin = {
  id: string;
  hookRoutes?: (routes: UniversalRoute[], components: RouteComponents) => UniversalRoute[];
  hookComponents?: (components: RouteComponents) => any;
  hookBlocks?: () => { [name: string]: React.FC<any> };
};

export class PluginManager {
  plugins: Plugin[];

  constructor(plugins: Plugin[]) {
    this.plugins = plugins;

    // Hook blocks.
    for (const plugin of this.plugins) {
      if (plugin.hookBlocks) {
        plugin.hookBlocks();
      }
    }
  }

  updatePlugin(plugin: Plugin) {
    const found = this.plugins.find(p => p.id === plugin.id);
    console.log('Looking for plugin', plugin.id);
    if (found) {
      const idx = this.plugins.indexOf(found);
      console.log('replacing plugin...', idx);
      this.plugins[idx] = plugin;
    }
  }

  makeRoutes(routeComponents: any): RouteComponents[] {
    const newRoutes = this.hookRoutes(routeComponents.routes, routeComponents);

    return [
      {
        ...routeComponents.baseRoute,
        routes: [...newRoutes, routeComponents.fallback],
      },
    ];
  }

  hookComponents(components: any) {
    const returnComponents = { ...components };
    for (const plugin of this.plugins) {
      if (plugin.hookComponents) {
        const newComponents = plugin.hookComponents(components);
        const keys = Object.keys(newComponents);
        for (const key of keys) {
          returnComponents[key] = createPluginWrapper((newComponents as any)[key] as any);
        }
      }
    }

    return returnComponents;
  }

  hookRoutes(routes: UniversalRoute[], components: any) {
    const newRoutes = [...routes];
    for (const plugin of this.plugins) {
      if (plugin.hookRoutes) {
        const hooked = plugin.hookRoutes(routes, components);
        for (const hookedRoute of hooked) {
          hookedRoute.component = createPluginWrapper(hookedRoute.component);
        }
        newRoutes.push(...hooked);
      }
    }

    return newRoutes;
  }
}
