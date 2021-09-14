import { RouteMiddleware } from '../types/route-middleware';

export const staticPage: RouteMiddleware<{ slug: string }> = async (context, next) => {
  await next();

  // Only want to enable this from the context of the madoc site.
  if (typeof context.staticPage !== 'undefined' && context.params && context.params.slug) {
    if (typeof context.staticPage !== 'string') {
      context.staticPage = await context.staticPage(context.state.jwt ? context.state.jwt.token : '');
    }

    if (context.staticPage) {
      context.response.body = context.staticPage;
    }
  }
};
