import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const testWebhook: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const site = await context.siteManager.getSiteById(siteId);

  context.response.body = {
    endpoint: await context.webhookExtension.generateWebhookUrl(site, 'test-event', 3600),
    expires: 3600,
  };
};
