import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const getWebhookCalls: RouteMiddleware<{ webhook_id?: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const eventId = context.query.event_id || null;
  const callId = context.query.call_id || null;
  const webhook = context.params.webhook_id || context.query.webhook_id || null;
  const page = context.query.page || 0;
  const perPage = 40;

  context.response.body = await context.webhooks.listWebhookCalls(
    { webhook, event_id: eventId, call_id: callId },
    { page, perPage },
    siteId
  );
};
