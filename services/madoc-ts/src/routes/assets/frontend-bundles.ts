import send from 'koa-send';
import { FRONTEND_BUNDLE_PATH } from '../../paths';
import { RouteMiddleware } from '../../types/route-middleware';

export const frontendBundles: RouteMiddleware<{
  slug: string;
  bundleName: string;
}> = async (context, next) => {
  if (
    process.env.NODE_ENV === 'production' ||
    !(process.env.NODE_ENV === 'development' && process.env.watch === 'false')
  ) {
    if ((context.params.bundleName || '').match(/\.\./) || !context.params.bundleName) {
      context.status = 404;
      return;
    }

    await send(context, context.params.bundleName, { root: FRONTEND_BUNDLE_PATH });
  } else {
    await next();
  }
};
