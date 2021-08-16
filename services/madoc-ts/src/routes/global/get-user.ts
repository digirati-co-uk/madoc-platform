import { GetUser } from '../../extensions/site-manager/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const getUser: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);

  const userId = Number(context.params.userId);

  const [user, sites] = await Promise.all([
    context.siteManager.getUserById(userId),
    context.siteManager.getUserSites(userId),
  ]);

  context.response.body = {
    user,
    sites,
  } as GetUser;
};
