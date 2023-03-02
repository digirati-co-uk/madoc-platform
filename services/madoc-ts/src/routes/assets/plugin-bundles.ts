import send from 'koa-send';
import path from 'path';
import { PLUGINS_PATH } from '../../paths';
import { RouteMiddleware } from '../../types/route-middleware';

export const pluginBundles: RouteMiddleware<{
  slug: string;
  pluginId: string;
  revisionId: string;
}> = async context => {
  if (context.params.pluginId.match(/\.\./) || (context.params.revisionId || '').match(/\.\./)) {
    context.status = 404;
    return;
  }

  const root = path.resolve(PLUGINS_PATH, context.params.pluginId, context.params.revisionId);

  await send(context, 'plugin.js', { root });
};
