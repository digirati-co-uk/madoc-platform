import { RouteMiddleware } from '../types/route-middleware';
import type { StaticPageResponse } from '../types/static-page';

function isStaticPageStreamResponse(staticPage: StaticPageResponse): staticPage is Exclude<StaticPageResponse, string> {
  return typeof staticPage !== 'string' && !!staticPage && typeof staticPage.stream !== 'undefined';
}

export const staticPage: RouteMiddleware<{ slug: string }> = async (context, next) => {
  await next();

  // Only want to enable this from the context of the madoc site.
  if (typeof context.staticPage !== 'undefined' && context.params && context.params.slug) {
    let staticPageResponse = context.staticPage;

    if (typeof staticPageResponse === 'function') {
      staticPageResponse = await staticPageResponse(context.state.jwt ? context.state.jwt.token : '');
      context.staticPage = staticPageResponse;
    }

    if (staticPageResponse) {
      if (isStaticPageStreamResponse(staticPageResponse)) {
        context.response.type = staticPageResponse.contentType || 'text/html; charset=utf-8';
        context.response.body = staticPageResponse.stream;
      } else {
        context.response.type = 'text/html; charset=utf-8';
        context.response.body = staticPageResponse;
      }
    }
  }
};
