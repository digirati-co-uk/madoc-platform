import { RouteWithParams, TypedRouter } from '../utility/typed-router';
import { createWebhook } from './routes/create-webhook';
import { deleteWebhook } from './routes/delete-webhook';
import { executeWebhookInternal } from './routes/execute-webhook-internal';
import { getWebhook } from './routes/get-webhook';
import { getWebhookCalls } from './routes/get-webhook-calls';
import { listWebhooks } from './routes/list-webhooks';
import { publicWebhook } from './routes/public-webhook';
import { testWebhook } from './routes/test-webhook';

export const router: Record<keyof any, RouteWithParams<any>> = {
  'create-webhook': [TypedRouter.POST, '/api/madoc/webhooks', createWebhook],
  'delete-webhook': [TypedRouter.DELETE, '/api/madoc/webhooks/:id', deleteWebhook],
  'get-webhook': [TypedRouter.GET, '/api/madoc/webhooks/:id', getWebhook],
  'get-single-webhook-calls': [TypedRouter.GET, '/api/madoc/webhooks/:webhook_id/calls', getWebhookCalls],
  'list-webhooks': [TypedRouter.GET, '/api/madoc/webhooks', listWebhooks],
  'list-webhook-calls': [TypedRouter.GET, '/api/madoc/webhook-calls', getWebhookCalls],
  'internal-webhook-execute': [TypedRouter.POST, '/api/madoc/webhook-calls/:event_id', executeWebhookInternal],
  'site-webhook-execute': [TypedRouter.POST, '/s/:slug/madoc/api/webhook', publicWebhook],
  'test-webhook': [TypedRouter.POST, '/api/madoc/test-webhook', testWebhook],
};
