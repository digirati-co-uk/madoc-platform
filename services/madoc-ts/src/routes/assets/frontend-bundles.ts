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

  const bundle = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'lib',
    'frontend',
    context.params.bundleId,
    'build',
    context.params.bundleName || 'bundle.js'
  );

  if (existsSync(bundle)) {
    await send(context, bundle, { root: '/', maxAge: 3600000, immutable: true, gzip: true });
    return;
  }

  context.status = 404;
};
