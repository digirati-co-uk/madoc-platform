import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const listApiKeys: RouteMiddleware = async context => {
  const { siteId } = await onlyGlobalAdmin(context);

  const keys = await context.apiKeys.listApiKeys(siteId);

  context.response.body = { keys };
};
