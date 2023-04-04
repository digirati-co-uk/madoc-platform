import { generateId } from '../../frontend/shared/capture-models/helpers/generate-id';
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { WebhookCallRow } from '../webhook-types';
import { outgoingWebhook } from '../webhook-utils';

export const executeWebhookInternal: RouteMiddleware<{ event_id: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.admin']);

  const eventId = context.params.event_id;
  const body = context.requestBody;

  const hooks = context.webhookExtension.getHooksForEvents(eventId, siteId);
  const results = { success: 0, fail: 0 };
  const callId = generateId();

  const siteApi = api.asUser({ siteId }, {}, true);

  const databaseHooks = await context.webhooks.listWebhooksByEvent(eventId, siteId);

  for (const databaseHook of databaseHooks) {
    const result: Partial<WebhookCallRow> = {
      request: body,
      response: null,
      status_code: 200,
      site_id: siteId,
      event_id: eventId,
      is_outgoing: true,
      webhook_id: databaseHook.id,
      success: true,
      call_id: callId,
    };

    const didPass = await outgoingWebhook(databaseHook.url, databaseHook.body_template, result);

    if (didPass) {
      results.success++;
    } else {
      results.fail++;
    }

    await context.webhooks.createWebhookCall(result as any, siteId);
  }

  for (const hook of hooks) {
    const result: Partial<WebhookCallRow> = {
      request: body,
      response: null,
      status_code: 200,
      site_id: siteId,
      event_id: eventId,
      is_outgoing: hook.is_outgoing,
      static_id: hook.type,
      success: true,
      call_id: callId,
    };
    try {
      if (hook.is_outgoing) {
        const didPass = await outgoingWebhook(hook.url, hook.body_template, result);

        if (didPass) {
          results.success++;
        } else {
          results.fail++;
        }
        continue;
      } else {
        // Do internal thing.
        result.response = (await hook.execute(body, siteApi)) || {};
      }
      results.success++;
    } catch (e) {
      result.status_code = 500;
      result.response = `${e}`;
      result.success = false;
      results.fail++;
    }

    await context.webhooks.createWebhookCall(result as any, siteId);
  }

  context.response.body = { results };
};
