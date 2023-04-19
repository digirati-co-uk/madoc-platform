import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const deleteWebhook: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  await context.webhooks.deleteWebhook(context.params.id, siteId);

  context.response.status = 204;
};
