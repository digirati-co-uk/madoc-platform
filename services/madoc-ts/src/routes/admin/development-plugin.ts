import * as path from 'path';
import { PLUGINS_PATH } from '../../paths';
import { RouteMiddleware } from '../../types/route-middleware';
import { SitePlugin } from '../../types/schemas/plugins';
import { createLimitedSignedToken } from '../../utility/create-signed-token';
import { RequestError } from '../../utility/errors/request-error';
import { sandboxedRequire } from '../../utility/sandboxed-require';
import { userWithScope } from '../../utility/user-with-scope';
import { existsSync, writeFileSync, unlinkSync, rmdirSync } from 'fs';
import mkdirp from 'mkdirp';
import { createHash } from 'crypto';

export const developmentPlugin: RouteMiddleware<unknown, { pluginId: string }> = async context => {
  const { siteId, id, siteName } = userWithScope(context, ['site.admin']);

  if (!context.requestBody.pluginId) {
    throw new RequestError('No plugin ID');
  }

  const plugin = await context.plugins.getSitePlugin(context.requestBody.pluginId, siteId);

  if (!plugin) {
    throw new RequestError('Invalid plugin');
  }

  if (!plugin.enabled) {
    throw new RequestError('Plugin is not enabled');
  }

  if (!plugin.development.enabled) {
    throw new RequestError('Plugin is not in development mode');
  }

  const token = createLimitedSignedToken({
    name: plugin.name,
    identifier: plugin.id,
    data: {
      installedVersion: plugin.version,
    },
    site: { id: siteId, name: siteName },
    scope: ['dev.bundle'],
    expiresIn: 24 * 60 * 60, // 24 hour token.
  });

  if (!token) {
    throw new RequestError();
  }

  await context.plugins.createPluginToken(
    {
      name: 'Development plugin token',
      scope: ['dev.bundle'],
      expiresIn: 24 * 60 * 60,
      pluginId: plugin.id,
      isDevToken: true,
      tokenHash: createHash('sha1')
        .update(token)
        .digest('hex'),
    },
    id,
    siteId
  );

  context.response.body = { token };
};

export const acceptNewDevelopmentBundle: RouteMiddleware<
  unknown,
  {
    plugin: SitePlugin;
    bundle: {
      features: {
        hookBlocks: boolean;
        hookComponents: boolean;
        hookRoutes: boolean;
      };
      code: string;
    };
  }
> = async context => {
  if (!context.state.jwt || !context.state.jwt.scope || context.state.jwt.scope.indexOf('dev.bundle') === -1) {
    return;
  }

  const siteId = context.state.jwt.site.id;
  const body = context.requestBody;

  if (body.plugin.development.enabled && body.plugin.development.revision) {
    // 0. Validate JWT token and scope.
    // 1. Fetch from database.

    const plugin = await context.plugins.getSitePlugin(body.plugin.id, siteId);

    const previousRevision = plugin.development.enabled ? plugin.development.revision : undefined;

    // 2. Save to disk.
    const dir = path.join(PLUGINS_PATH, `/${plugin.id}/${body.plugin.development.revision}/`);
    mkdirp.sync(dir);
    writeFileSync(`${dir}/plugin.js`, body.bundle.code);

    // Update plugins
    const module = sandboxedRequire(`${dir}/plugin.js`);

    context.pluginManager.installPlugin({
      definition: {
        ...plugin,
        development: {
          enabled: true,
          revision: body.plugin.development.revision,
        },
        siteId,
      },
      siteId,
      module,
    });

    if (previousRevision) {
      // 3. Remove previous revision from disk.
      try {
        const oldDir = path.join(PLUGINS_PATH, `/${plugin.id}/${previousRevision}/`);
        if (existsSync(`${oldDir}/plugin.js`)) {
          unlinkSync(`${oldDir}/plugin.js`);
        }
        if (existsSync(`${oldDir}`)) {
          rmdirSync(oldDir);
        }
      } catch (e) {
        // fail silently.
      }
    }

    // 4. Update database.
    await context.plugins.updateDevRevision(plugin.id, body.plugin.development.revision, siteId);
  }

  context.response.status = 201;
};
