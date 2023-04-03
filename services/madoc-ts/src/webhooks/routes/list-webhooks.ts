import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const listWebhooks: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const eventId = context.query.event_id;

  context.response.body = eventId
    ? await context.webhooks.listWebhooksByEvent(eventId, siteId)
    : await context.webhooks.listWebhooks(siteId);
};
