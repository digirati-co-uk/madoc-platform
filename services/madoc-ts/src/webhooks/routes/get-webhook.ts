import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const getWebhook: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  context.response.body = await context.webhooks.getWebhookById(context.params.id, siteId);
};
