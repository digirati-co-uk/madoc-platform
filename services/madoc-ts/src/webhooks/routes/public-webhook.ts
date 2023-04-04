import invariant from 'tiny-invariant';
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';

export const publicWebhook: RouteMiddleware<{ slug: string }> = async context => {
  const site = await context.siteManager.getSiteBySlug(context.params.slug);
  const siteApi = api.asUser({ siteId: site.id }, { siteSlug: site.slug }, true);

  // We have the body.
  const body = context.requestBody || {};

  // We have the type
  const eventId = context.query.event_id;
  const code = context.query.code;

  invariant(site, 'Invalid site');

  await context.webhookExtension.validate(eventId, site.id, code);

  // Now make call.
  await siteApi.webhooks.executeWebhook(eventId, body);

  context.response.status = 200;
};
