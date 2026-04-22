import { RouteMiddleware } from '../../types/route-middleware';
import { buildAccountEntryPath } from './account-route-helper';

function appendQueryParam(params: URLSearchParams, key: string, value: string | string[] | undefined) {
  if (typeof value === 'undefined') {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      params.append(key, item);
    }
    return;
  }

  params.append(key, value);
}

export function redirectPrivateSiteAuthRoute(accountPath: string): RouteMiddleware<{ slug: string }> {
  return async (context, next) => {
    if (context.state.jwt) {
      await next();
      return;
    }

    const site = await context.siteManager.getSiteBySlug(context.params.slug);
    if (site.is_public) {
      await next();
      return;
    }

    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(context.query)) {
      appendQueryParam(query, key, value as string | string[] | undefined);
    }

    context.redirect(buildAccountEntryPath(accountPath, site.slug, query));
  };
}
