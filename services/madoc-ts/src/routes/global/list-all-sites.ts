import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { RequestError } from '../../utility/errors/request-error';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const listAllSites: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  const orderBy = context.query.order_by;
  const orderDesc = castBool(context.query.desc);

  if (orderBy && ['title', 'slug', 'modified', 'created'].indexOf(orderBy) === -1) {
    throw new RequestError(`Unsupported sort by "${orderBy}"`);
  }

  const [sites, siteStats] = await Promise.all([
    context.siteManager.listAllSites({ orderBy, orderDesc }),
    context.siteManager.getSiteStatistics(),
  ]);

  context.response.body = { sites, siteStats };
};
