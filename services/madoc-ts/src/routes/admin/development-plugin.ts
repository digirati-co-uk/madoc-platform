import { RouteMiddleware } from '../../types/route-middleware';
import { createLimitedSignedToken } from '../../utility/create-signed-token';
import { userWithScope } from '../../utility/user-with-scope';
import { writeFileSync } from 'fs';
import mkdirp from 'mkdirp';

export const fileDirectory = process.env.OMEKA_FILE_DIRECTORY || '/home/node/app/omeka-files';

export const developmentPlugin: RouteMiddleware = async context => {
  const { siteId, siteName } = userWithScope(context, ['site.admin']);

  const token = createLimitedSignedToken({
    name: 'Test plugin',
    identifier: 'test-plugin',
    data: {
      // other data.
    },
    site: { id: siteId, name: siteName },
    scope: ['dev.bundle'],
    expiresIn: 24 * 60 * 60, // 24 hour token.
  });

  context.response.body = { token };
};

export const acceptNewDevelopmentBundle: RouteMiddleware<
  {},
  {
    pluginId: string;
    revision: string;
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

  const body = context.requestBody;

  // 0. Validate JWT token and scope.
  // 1. Fetch from database.
  // 2. Save to disk.

  const dir = `${fileDirectory}/dev/${body.pluginId}/${body.revision}/`;
  mkdirp.sync(dir);
  writeFileSync(`${dir}/plugin.js`, body.bundle.code);

  // Update plugins

  delete require.cache[require.resolve(`${dir}/plugin.js`)];

  const module = require(`${dir}/plugin.js`);

  context.pluginManager.updatePlugin(module);

  console.log(module);

  context.response.status = 201;

  // 3. Remove previous revision.
  // 4. Update database.
};
