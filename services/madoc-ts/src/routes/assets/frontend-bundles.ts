import * as path from 'path';
import send from 'koa-send';
import { RouteMiddleware } from '../../types/route-middleware';
import { pluginDirectory } from '../admin/development-plugin';

export const fileDirectory = process.env.OMEKA_FILE_DIRECTORY || '/home/node/app/omeka-files';

export const frontendBundles: RouteMiddleware<{
  slug: string;
  bundleId: string;
  bundleName?: string;
}> = async (context, next) => {
  if (
    process.env.NODE_ENV === 'production' ||
    !(process.env.NODE_ENV === 'development' && process.env.watch === 'false')
  ) {
    if (context.params.bundleId.match(/\.\./) || (context.params.bundleName || '').match(/\.\./)) {
      context.status = 404;
      return;
    }

    const root = path.resolve(__dirname, '..', '..', '..', 'lib', 'frontend');

    const bundle = path.join(
      'build',
      context.params.bundleName ? context.params.bundleName : `${context.params.bundleId}.bundle.js`
    );

    await send(context, bundle, { root });
  } else {
    await next();
  }
};

export const pluginBundles: RouteMiddleware<{
  slug: string;
  pluginId: string;
  revisionId: string;
}> = async context => {
  if (context.params.pluginId.match(/\.\./) || (context.params.revisionId || '').match(/\.\./)) {
    context.status = 404;
    return;
  }

  const root = path.resolve(pluginDirectory, context.params.pluginId, context.params.revisionId);

  await send(context, 'plugin.js', { root });
};
