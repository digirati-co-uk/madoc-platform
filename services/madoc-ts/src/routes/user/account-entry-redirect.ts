import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { ACCOUNT_PATH_PREFIX, ACCOUNT_SITE_QUERY_PARAM, getFirstQueryValue } from './account-route-helper';

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

export function accountEntryRedirect(accountPath: string): RouteMiddleware {
  return async context => {
    const requestedSite = getFirstQueryValue(context.query[ACCOUNT_SITE_QUERY_PARAM]);
    const systemConfig = await context.siteManager.getSystemConfig();
    const siteSlug = requestedSite || systemConfig.defaultSite;

    if (!siteSlug) {
      throw new NotFound();
    }

    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(context.query)) {
      if (key === ACCOUNT_SITE_QUERY_PARAM) {
        continue;
      }
      appendQueryParam(query, key, value as string | string[] | undefined);
    }

    const queryString = query.toString();
    context.redirect(`${ACCOUNT_PATH_PREFIX}/${siteSlug}/${accountPath}${queryString ? `?${queryString}` : ''}`);
  };
}
