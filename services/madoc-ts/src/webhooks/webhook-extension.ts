import { stringify } from 'query-string';
import invariant from 'tiny-invariant';
import { BaseExtension, defaultDispose } from '../extensions/extension-manager';
import { ApiClient } from '../gateway/api';
import { WebhookCallRow, WebhookRow } from './webhook-types';

export class WebhookExtension implements BaseExtension {
  api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async listWebhooks(query?: { event_id?: string }) {
    return this.api.request<WebhookRow[]>(`/api/madoc/webhooks${query ? `?${stringify(query)}` : ''}`);
  }

  async getWebhookById(id: string) {
    return this.api.request<WebhookRow>(`/api/madoc/webhooks/${id}`);
  }

  async deleteWebhook(id: string) {
    return this.api.request<WebhookRow>(`/api/madoc/webhooks/${id}`, { method: 'DELETE' });
  }

  async createWebhook(webhook: Omit<WebhookRow, 'id' | 'created'>) {
    return this.api.request<WebhookRow>(`/api/madoc/webhooks`, {
      method: 'POST',
      body: webhook,
    });
  }

  async updateWebhook(webhook: WebhookRow) {
    invariant(webhook.id, 'Webhook id is required to update');

    return this.api.request<WebhookRow>(`/api/madoc/webhooks`, {
      method: 'POST',
      body: webhook,
    });
  }

  async executeWebhook(eventId: string, body: any) {
    return this.api.request(`/api/madoc/webhook-calls/${eventId}`, {
      method: 'POST',
      body,
    });
  }

  async listWebhookCalls(query: { webhook_id?: string; call_id?: string; event_id?: string; page?: number }) {
    return this.api.request<WebhookCallRow[]>(`/api/madoc/webhook-calls${query ? `?${stringify(query)}` : ''}`);
  }

  async getSingleWebhookCalls(id: string, query?: { event_id?: string; page?: number }) {
    return this.api.request<WebhookCallRow[]>(`/api/madoc/webhooks/${id}/calls?${stringify(query || { page: 0 })}}`);
  }

  dispose() {
    defaultDispose(this);
  }
}
