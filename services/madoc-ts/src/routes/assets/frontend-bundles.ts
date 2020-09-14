import { existsSync } from 'fs';
import * as path from 'path';
import send from 'koa-send';
import { RouteMiddleware } from '../../types/route-middleware';

export const frontendBundles: RouteMiddleware<{
  slug: string;
  bundleId: string;
  bundleName?: string;
}> = async context => {
  if (context.params.bundleId.match(/\.\./) || (context.params.bundleName || '').match(/\.\./)) {
    context.status = 404;
    return;
  }

  const root = path.resolve(__dirname, '..', '..', '..', 'lib', 'frontend');

  const bundle = path.join(context.params.bundleId, 'build', context.params.bundleName || 'bundle.js');

  await send(context, bundle, { root });
};
