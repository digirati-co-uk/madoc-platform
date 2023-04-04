import { sql } from 'slonik';
import invariant from 'tiny-invariant';
import { generateId } from '../frontend/shared/capture-models/helpers/generate-id';
import { BaseRepository } from '../repository/base-repository';
import { WebhookCallRow, WebhookRow } from './webhook-types';

export class WebhookRepository extends BaseRepository {
  static mutations = {
    createWebhook: (webhook: Omit<WebhookRow, 'created' | 'site_id'>, site_id: number) => sql<WebhookRow>`
        insert into webhook (id, event_id, url, site_id, scope, creator, body_template)
        values (
          ${webhook.id},
          ${webhook.event_id},
          ${webhook.url},
          ${site_id},
          ${sql.array(webhook.scope || [], 'text')},
          ${webhook.creator},
          ${webhook.body_template || ''}
        )
        returning *
    `,
    updateWebhook: (webhook: WebhookRow, site_id: number) => sql<WebhookRow>`
        update webhook
        set event_id=${webhook.event_id},
            url=${webhook.url},
            scope=${webhook.scope || []},
            body_template=${webhook.body_template}
        where id = ${webhook.id}
          and site_id = ${site_id}
        returning *
    `,
    deleteWebhook: (id: string, site_id: number) => sql`
      delete from webhook where id = ${id} and site_id = ${site_id}
    `,
    createWebhookCall: (req: Omit<WebhookCallRow, 'time' | 'site_id'>, site_id: number) => sql<WebhookRow>`
      insert into webhook_call (
        id, is_outgoing, status_code, site_id, webhook_id, request, response, static_id, event_id, call_id, success
      ) 
      values (
       ${req.id},
       ${Boolean(req.is_outgoing)},
       ${req.status_code},
       ${site_id},
       ${req.webhook_id || null},
       ${req.request || ''},
       ${req.response || ''},
       ${req.static_id || null},
       ${req.event_id},
       ${req.call_id},
       ${Boolean(req.success)}
      ) returning *
    `,
  };

  static queries = {
    listWebhooks: (site_id: number) => sql<WebhookRow>`
      select * from webhook where site_id = ${site_id}
    `,
    listWebhooksByEvent: (event_id: string, site_id: number) => sql<WebhookRow>`
      select * from webhook where site_id = ${site_id} and event_id = ${event_id}
    `,
    getWebhookById: (id: string, site_id: number) => sql<WebhookRow>`
      select * from webhook where id = ${id} and site_id = ${site_id}
    `,
    listWebhookCalls: (
      {
        webhook,
        event_id,
        call_id,
      }: {
        webhook?: string;
        event_id?: string;
        call_id?: string;
      },
      paging: { page: number; perPage: number },
      site_id: number
    ) => {
      const offset = paging.perPage * paging.page;

      const webhookQuery = webhook ? sql`and (wc.webhook_id = ${webhook} or wc.static_id = ${webhook})` : sql``;
      const eventIdQuery = event_id ? sql`and wc.event_id = ${event_id}` : sql``;
      const callIdQuery = call_id ? sql`and wc.call_id = ${call_id}` : sql``;

      return sql<WebhookCallRow>`
        select *
        from webhook_call wc
        where wc.site_id = ${site_id} ${webhookQuery} ${eventIdQuery} ${callIdQuery}
        order by wc.time desc
        limit ${paging.perPage} offset ${offset}
      `;
    },
  };

  async createWebhook(webhook: Omit<WebhookRow, 'id' | 'site_id' | 'created'>, site_id: number) {
    invariant(webhook.creator, 'webhook must have creator');
    invariant(webhook.url, 'webhook must have url');
    invariant(webhook.event_id, 'webhook must have event_id');
    invariant(site_id, 'site_id required to create webhook');

    return await this.connection.one(
      WebhookRepository.mutations.createWebhook(
        {
          id: generateId(),
          scope: [],
          ...webhook,
        },
        site_id
      )
    );
  }
  async updateWebhook(webhook: WebhookRow, site_id: number) {
    invariant(webhook.id, 'webhook must have id');
    invariant(webhook.url, 'webhook must have url');
    invariant(webhook.event_id, 'webhook must have event_id');
    invariant(site_id, 'site_id required to update webhook');

    return await this.connection.one(
      WebhookRepository.mutations.updateWebhook(
        {
          scope: [],
          ...webhook,
        },
        site_id
      )
    );
  }
  async deleteWebhook(id: string, site_id: number) {
    invariant(id, 'webhook must have id');
    invariant(site_id, 'site_id required to delete webhook');

    await this.connection.query(WebhookRepository.mutations.deleteWebhook(id, site_id));
  }
  async createWebhookCall(req: Omit<WebhookCallRow, 'id' | 'time' | 'site_id'>, site_id: number) {
    invariant(req.webhook_id || req.static_id, 'webhook call must have either webhook_id or static_id');
    invariant(req.event_id, 'webhook call must have event_id');
    invariant(site_id, 'site_id required to make webhook call');

    return await this.connection.one(
      WebhookRepository.mutations.createWebhookCall(
        {
          ...req,
          id: generateId(),
          request: typeof req.request === 'string' ? req.request : JSON.stringify(req.request),
          response: typeof req.response === 'string' ? req.response : JSON.stringify(req.response),
        },
        site_id
      )
    );
  }
  async listWebhooks(site_id: number) {
    invariant(site_id);
    return await this.connection.any(WebhookRepository.queries.listWebhooks(site_id));
  }
  async listWebhooksByEvent(event_id: string, site_id: number) {
    invariant(site_id);
    return await this.connection.any(WebhookRepository.queries.listWebhooksByEvent(event_id, site_id));
  }
  async getWebhookById(id: string, site_id: number) {
    invariant(site_id);
    return await this.connection.one(WebhookRepository.queries.getWebhookById(id, site_id));
  }
  async listWebhookCalls(
    query: {
      webhook?: string;
      event_id?: string;
      call_id?: string;
    },
    paging: { page: number; perPage: number },
    site_id: number
  ) {
    return await this.connection.any(WebhookRepository.queries.listWebhookCalls(query, paging, site_id));
  }
}
