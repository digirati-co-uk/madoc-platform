import { CaptureModelShorthand } from '../extensions/projects/types';
import { mustache } from '../utility/mustache';
import { WebhookCallRow, WebhookRow } from './webhook-types';

export const webhookShorthandModel: CaptureModelShorthand<keyof Omit<
  WebhookRow,
  'id' | 'created_at' | 'creator' | 'site_id' | 'scope'
>> = {
  event_id: { type: 'text-field' },
  url: { type: 'text-field' },
  body_template: { type: 'text-field', multiline: true } as any,
};

export async function outgoingWebhook(url: string, template: string, result: Partial<WebhookCallRow>) {
  let request = JSON.stringify(result.request);

  if (template) {
    result.request = request = mustache(template, result.request);
  }

  if (url) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        body: request,
      });
      try {
        result.response = await resp.text();
      } catch (e) {
        result.response = {};
      }

      if (resp.ok) {
        return true;
      } else {
        result.status_code = resp.status;
        result.response = { error: resp.statusText };
        result.success = false;
        return false;
      }
    } catch (e) {
      result.status_code = 500;
      result.response = `${e}`;
      result.success = false;
      return false;
    }
  } else {
    result.status_code = 500;
    result.response = `Invalid webhook (reason: no URL)`;
    result.success = false;
    return false;
  }
}
