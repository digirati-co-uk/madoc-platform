import { DatabasePoolType } from 'slonik';
import { PluginManager, PluginModule } from '../frontend/shared/plugins/plugin-manager';
import { PluginRepository } from '../repository/plugin-repository';
import { pluginDirectory } from '../routes/admin/development-plugin';
import { ModuleWrapper } from '../types/plugins';
import { SitePlugin } from '../types/schemas/plugins';
import { sandboxedRequire } from '../utility/sandboxed-require';

export function loadPluginModule(plugin: SitePlugin): { module: ModuleWrapper | null; error: boolean } {
  if (!plugin.enabled) {
    console.log(`Plugin<site:${plugin.siteId}>: ${plugin.name} (${plugin.id}) | ${plugin.version} [not enabled]`);
    return { module: null, error: false };
  }

  if (plugin.id.indexOf('../') !== -1 || plugin.version.indexOf('../') !== -1) {
    console.log(`Plugin<site:${plugin.siteId}>: ${plugin.name} (${plugin.id}) | ${plugin.version} [error]`);
    return { module: null, error: true };
  }

  if (plugin.development.enabled && plugin.development.revision) {
    if (plugin.development.revision.indexOf('../') !== -1) {
      console.log(
        `Plugin<site:${plugin.siteId}>: ${plugin.name} (${plugin.id}) | ${plugin.development.revision} [error]`
      );
      return { module: null, error: true };
    }

    console.log(`Plugin<site:${plugin.siteId}>: ${plugin.name} (${plugin.id}) | ${plugin.development.revision} [dev]`);

    try {
      return {
        module: sandboxedRequire(`${pluginDirectory}/${plugin.id}/${plugin.development.revision}/plugin.js`),
        error: false,
      };
    } catch (e) {
      console.log(e);
      console.log(
        `Plugin<site:${plugin.siteId}>: ${plugin.name} (${plugin.id}) | ${plugin.development.revision} [error:module]`
      );
      return { module: null, error: true };
    }
  }

  // @todo first try plugins folder, then fallback to dev.
  //   When installing, we can also check permissions and show a warning.

  console.log(`Plugin<site:${plugin.siteId}>: ${plugin.name} (${plugin.id}) | ${plugin.version}`);
  try {
    return {
      module: sandboxedRequire(`${pluginDirectory}/${plugin.id}/${plugin.version}/plugin.js`),
      error: false,
    };
  } catch (e) {
    console.log(e);
    console.log(`Plugin<site:${plugin.siteId}>: ${plugin.name} (${plugin.id}) | ${plugin.version} [error:module]`);
    return {
      module: null,
      error: true,
    };
  }
}

export const createPluginManager = async (db: DatabasePoolType) => {
  return new Promise(resolve => {
    db.connect(async connection => {
      const result = await connection.any(PluginRepository.queries.listPlugins());
      const plugins = result.map(plugin => PluginRepository.mapPluginRow(plugin, true));

      // No we load them..
      const loadedPlugins = plugins
        .map(plugin => {
          if (!plugin.siteId) {
            return null;
          }

          const { module, error } = loadPluginModule(plugin);

          if (!module || error) {
            return null;
          }

          return {
            definition: plugin,
            siteId: plugin.siteId,
            module: module,
          };
        })
        .filter(plugin => plugin !== null) as PluginModule[];

      // Here we need to load _all_ plugins and their modules.
      resolve(new PluginManager(loadedPlugins));
    });
  });
};
