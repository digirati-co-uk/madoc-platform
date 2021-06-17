import * as fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import semver from 'semver/preload';
import { loadPluginModule } from '../../middleware/create-plugin-manager';
import { SitePlugin } from '../../types/schemas/plugins';
import { RouteMiddleware } from '../../types/route-middleware';
import { RequestError } from '../../utility/errors/request-error';
import { ServerError } from '../../utility/errors/server-error';
import { sandboxRun } from '../../utility/sandboxed-require';
import { userWithScope } from '../../utility/user-with-scope';
import NodeStreamZip from 'node-stream-zip';
import { pluginDirectory } from './development-plugin';

export const listPlugins: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  context.response.status = 200;
  context.response.body = {
    plugins: await context.plugins.listPlugins(siteId),
  };
};

export const getPlugin: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const id = context.params.id;

  context.response.status = 200;
  context.response.body = await context.plugins.getSitePlugin(id, siteId);
};

export const installPlugin: RouteMiddleware<{}, SitePlugin> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const plugin = context.requestBody;

  context.response.status = 201;
  const installedPlugin = await context.plugins.installPlugin(plugin, siteId);
  context.response.body = installedPlugin;

  const definition = {
    ...installedPlugin,
    siteId,
  };

  const loaded = loadPluginModule(definition);
  if (loaded.module && !loaded.error) {
    context.pluginManager.installPlugin({
      siteId,
      definition: definition,
      module: loaded.module,
    });
  }
};

export const disablePlugin: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  // 1. Get plugin
  const plugin = await context.plugins.getSitePlugin(context.params.id, siteId);

  if (!plugin) {
    throw new RequestError('Invalid plugin');
  }

  // 2. Mark as not enabled in database
  await context.plugins.disablePlugin(plugin.id, siteId);

  // 3. Disable in module
  context.pluginManager.uninstallPlugin(plugin.id, siteId);

  context.response.status = 200;
};

export const enablePlugin: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  // 1. Get plugin
  const plugin = await context.plugins.getPlugin(context.params.id);

  // 2. Make sure its installed
  if (!plugin || !plugin.installed) {
    throw new RequestError('Plugin not installed');
  }

  // 3. Install plugin to site.
  const installedPlugin = await context.plugins.installPlugin(
    {
      ...plugin,
      enabled: false,
      siteId,
    },
    siteId
  );

  // 3. Enable plugin
  const definition = {
    ...installedPlugin,
    enabled: true,
    siteId,
  };

  // Enable and load.
  const loaded = loadPluginModule(definition);

  if (!loaded.module || loaded.error) {
    await context.plugins.disablePlugin(plugin.id, siteId);
    throw new ServerError('Plugin not loaded');
  }

  await context.plugins.enablePlugin(plugin.id, siteId);

  context.pluginManager.installPlugin({
    siteId,
    definition: definition,
    module: loaded.module,
  });

  context.response.body = installedPlugin;
};

export const getPluginDependencies: RouteMiddleware<{ id: string }> = async context => {
  userWithScope(context, ['site.admin']);

  context.response.body = {
    dependencies: await context.plugins.getPluginSites(context.params.id),
  };
};

export const uninstallPlugin: RouteMiddleware<{ id: string }> = async context => {
  userWithScope(context, ['site.admin']);
  // 1. Get plugin
  const plugin = await context.plugins.getPlugin(context.params.id);
  if (!plugin) {
    context.status = 200;
  }

  // 2. Make sure disabled on all sites
  const totalDependencies = await context.plugins.getPluginSites(context.params.id);
  if (totalDependencies) {
    throw new RequestError('Disable plugins on all sites before uninstalling');
  }

  // 3. Delete from database
  await context.plugins.deletePlugin(context.params.id);

  // @todo 4. Delete from disk - not so quick as it involved recursively deleting directory.

  context.status = 200;
};

export const viewRemotePlugin: RouteMiddleware<{ author: string; repo: string }> = async context => {
  userWithScope(context, ['site.admin']);

  const author = context.params.author;
  const repo = context.params.repo;

  const parse = (r: Response) => {
    if (r.status >= 300) {
      throw new RequestError('Invalid plugin');
    }
    return r.json();
  };

  const [repoDetails, releases] = await Promise.all([
    fetch(`https://api.github.com/repos/${author}/${repo}`).then(parse),
    fetch(`https://api.github.com/repos/${author}/${repo}/releases`).then(parse),
  ]).catch(() => {
    throw new RequestError('Invalid plugin');
  });

  const [latestRelease, ...restReleases] = releases.filter((release: any) => {
    return !!release.assets.find((asset: any) => asset.name === 'plugin.zip');
  });

  const existingPlugin = await context.plugins.getPluginByRepository(author, repo);

  const latestVersion = latestRelease && latestRelease.tag_name ? semver.clean(latestRelease.tag_name) : null;

  context.response.body = {
    name: repoDetails.name,
    owner: { name: repoDetails.owner.login, logo: repoDetails.owner.avatar_url, url: repoDetails.owner.html_url },
    description: repoDetails.description,
    enabled: existingPlugin?.enabled || false,
    installed: existingPlugin?.installed || false,
    installable: !!latestRelease && !existingPlugin,
    upToDate: existingPlugin && latestVersion ? semver.eq(latestVersion, existingPlugin.version) : false,
    url: repoDetails.html_url,
    stars: repoDetails.stargazers_count,
    issues: repoDetails.open_issues_count,
    license: repoDetails.license
      ? {
          name: repoDetails.license.name,
          key: repoDetails.license.key,
          spdx_id: repoDetails.license.spdx_id,
        }
      : null,
    installedVersion: existingPlugin?.version,
    latestVersion: latestVersion,
    versions: restReleases.map((r: any) => (r.tag_name ? semver.clean(r.tag_name) : null)),
  };
};

// @todo.
export const disableDevMode: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const plugin = await context.plugins.getSitePlugin(context.params.id, siteId);

  if (plugin.development.enabled) {
    if (plugin.installed) {
      // Just disable development mode and update module to point to which one its on.
    } else {
      // Remove plugin.
    }
  }

  context.response.status = 200;
};

export const installRemotePlugin: RouteMiddleware<
  {},
  { owner: string; repository: string; version?: string }
> = async context => {
  userWithScope(context, ['site.admin']);

  const pluginLocation = context.requestBody;
  // - Is this plugin already installed?
  const plugin = await context.plugins.getPluginByRepository(pluginLocation.owner, pluginLocation.repository);

  if (plugin) {
    // - Should we try to update it?
  }

  const releases = await fetch(
    `https://api.github.com/repos/${pluginLocation.owner}/${pluginLocation.repository}/releases`
  ).then(r => r.json());

  // - Is there a valid release for this plugin
  if (!releases.length) {
    throw new Error(); // @todo more descriptive.
  }

  // - Is there a version specified and does it exist?
  const chosenRelease = releases
    .filter((release: any) => {
      return !!release.assets.find((asset: any) => asset.name === 'plugin.zip');
    })
    .find((release: any) => {
      if (!pluginLocation.version || pluginLocation.version === 'latest') {
        return true; // find the first.
      }
      if (pluginLocation.version && pluginLocation.version === release.tag_name) {
        return true;
      }
    });

  // - Select the right github release
  if (!chosenRelease) {
    throw new RequestError(`Version ${pluginLocation.version} not found`);
  }

  // - Download and unzip the plugin
  const pluginZip = chosenRelease.assets.find((asset: any) => asset.name === 'plugin.zip');
  if (!pluginZip) {
    throw new ServerError();
  }

  if (!pluginZip.browser_download_url || !pluginZip.node_id) {
    throw new RequestError('Invalid release');
  }

  // - Save plugin.zip to temporary folder
  const zipResponse = await fetch(pluginZip.browser_download_url, { redirect: 'follow' });
  const pluginZipLocation = `${pluginDirectory}/temp/${pluginZip.node_id}/plugin.zip`;

  if (!zipResponse.body) {
    throw new RequestError('Invalid release (zip download)');
  }

  mkdirp.sync(`${pluginDirectory}/temp/${pluginZip.node_id}`);
  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(pluginZipLocation);
    if (zipResponse.body) {
      (zipResponse.body as any).pipe(fileStream);
      (zipResponse.body as any).on('error', (err: any) => {
        reject(err);
      });
      fileStream.on('finish', function() {
        resolve();
      });
    }
  });

  const zip = new NodeStreamZip({
    file: pluginZipLocation,
  });

  await new Promise(resolve => zip.on('ready', resolve));

  // - Make sure the madoc-plugin is valid
  const madocConfigData = zip.entryDataSync('madoc-plugin.json');
  const madocConfig = JSON.parse(madocConfigData.toString());
  const madocBundle = zip.entryDataSync('plugin.js').toString();

  if (!madocConfig.id) {
    throw new RequestError('Invalid madoc-plugin.json');
  }

  // - Check if the identifier matches the database entry
  if (plugin && plugin.id !== madocConfig.id) {
    throw new RequestError('ID of plugin in database does not match repository');
  }

  // - Run the plugin in isolation to verify that it can instanciate
  const module = sandboxRun(madocBundle);
  if (!module) {
    throw new RequestError('Invalid plugin bundle');
  }

  context.response.body = {
    config: madocConfig,
    bundle: madocBundle,
  };

  // - Add plugin to disk in the right place
  const pluginDest = `${pluginDirectory}/${madocConfig.id}/${madocConfig.version}`;
  mkdirp.sync(pluginDest);
  fs.writeFileSync(path.join(pluginDest, 'plugin.js'), madocBundle);
  fs.writeFileSync(path.join(pluginDest, 'madoc-plugin.json'), madocConfigData);

  // - Update the database
  if (plugin) {
    // update version
    context.response.body = await context.plugins.updatePlugin(
      madocConfig.id,
      madocConfig.version,
      madocConfig.name,
      madocConfig.description,
      madocConfig.thumbnail
    );

    // How do we update running service?
    context.pluginManager.updatePluginModule(madocConfig.id, module);

    context.response.status = 200;
  } else {
    // Create new.
    context.response.body = await context.plugins.createPlugin({
      id: madocConfig.id,
      name: madocConfig.name,
      description: madocConfig.description,
      thumbnail: madocConfig.thumbnail,
      installed: true,
      version: madocConfig.version,
      repository: {
        name: pluginLocation.repository,
        owner: pluginLocation.owner,
      },
      enabled: false,
      development: {
        enabled: false,
      },
    });

    context.response.status = 201;
  }
};
