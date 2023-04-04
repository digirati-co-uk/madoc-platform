import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';
import { WebhookRow } from '../webhook-types';

export const createWebhook: RouteMiddleware<any, Omit<WebhookRow, 'id' | 'created'>> = async context => {
  const { siteId, id: userId } = userWithScope(context, ['site.admin']);

  const webhook = context.requestBody;

  webhook.creator = userId;
  context.response.body = await context.webhooks.createWebhook(webhook, siteId);
};
