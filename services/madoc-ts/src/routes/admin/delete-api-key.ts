import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const deleteApiKey: RouteMiddleware = async context => {
  const { siteId } = await onlyGlobalAdmin(context);

  await context.apiKeys.deleteApiKey(context.params.client_id, siteId);

  context.response.status = 204;
};
