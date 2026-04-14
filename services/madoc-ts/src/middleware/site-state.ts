import { RouteMiddleware } from '../types/route-middleware';
import { api } from '../gateway/api.server';
import { cachedApiHelper } from '../utility/cached-api-helper';

type SiteStateContext = Parameters<RouteMiddleware<{ slug?: string }>>[0];
type SiteStateNext = Parameters<RouteMiddleware<{ slug?: string }>>[1];

async function withSiteState(context: SiteStateContext, next: SiteStateNext, allowPrivateSiteAccess = false) {
  const attachedState = context.state as unknown as {
    site?: unknown;
    siteApi?: unknown;
    cachedApi?: unknown;
  };

  if (attachedState.site && attachedState.siteApi && attachedState.cachedApi) {
    await next();
    return;
  }

  const slug = context.params?.slug;
  if (typeof slug === 'undefined') {
    await next();
    return;
  }

  const userId = context.state.jwt ? context.state.jwt.user.id : undefined;
  const isAdmin = context.state.jwt ? context.state.jwt.scope.indexOf('site.admin') !== -1 : false;
  const site = allowPrivateSiteAccess
    ? await context.siteManager.getSiteBySlug(slug)
    : await context.siteManager.getCachedSiteIdBySlug(slug, userId, isAdmin);
  if (!site.latestTerms) {
    const terms = await context.siteManager.getLatestTermsId(site.id);
    if (terms) {
      site.latestTerms = terms.id;
    }
  }
  const siteApi = api.asUser({ siteId: site.id, userId: userId }, { siteSlug: slug }, true);
  context.state.site = site;
  context.state.siteApi = siteApi;
  context.state.cachedApi = cachedApiHelper(siteApi, site.id);

  try {
    await next();
  } finally {
    siteApi.dispose();
  }
}

export const siteState: RouteMiddleware = async (context, next) => {
  await withSiteState(context, next);
};

export const siteStateAllowPrivate: RouteMiddleware = async (context, next) => {
  await withSiteState(context, next, true);
};
