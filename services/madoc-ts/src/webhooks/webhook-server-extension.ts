import { stringify } from 'query-string';
import invariant from 'tiny-invariant';
import { RegistryExtension } from '../extensions/registry-extension';
import { generateId } from '../frontend/shared/capture-models/helpers/generate-id';
import { apiGateway, gatewayHost } from '../gateway/api.server';
import { getPrivateKey, getPublicKey } from '../utility/jose-keys';
import { IncomingWebhook, OutgoingWebhook } from './webhook-types';
import { CompactSign, compactVerify } from 'jose';

export class WebhookServerExtension extends RegistryExtension<IncomingWebhook | OutgoingWebhook> {
  constructor() {
    super({
      registryName: 'webhook',
    });

    WebhookServerExtension.register({
      is_outgoing: false,
      type: 'example-test',
      event_id: 'test-event',
      execute: body => {
        console.log('Did this work?', body);
      },
    });
  }

  static register(definition: IncomingWebhook | OutgoingWebhook) {
    RegistryExtension.emitter.emit('webhook', definition);
  }

  static removePlugin(event: { pluginId: string; siteId?: number; type: string }) {
    RegistryExtension.emitter.emit('remove-plugin-webhook', event);
  }

  static registerPlugin(event: { pluginId: string; siteId?: number; definition: IncomingWebhook | OutgoingWebhook }) {
    RegistryExtension.emitter.emit('plugin-webhook', event);
  }

  async generateWebhookUrl(site: { id: number; slug: string }, eventId: string, expires: number, internal?: boolean) {
    const query = {
      event_id: eventId,
      code: await this.sign({ eventId, expires, siteId: site.id }),
    };

    return `${internal ? apiGateway : gatewayHost}/s/${site.slug}/madoc/api/webhook?${stringify(query)}`;
  }

  getHooksForEvents(eventId: string, siteId: number): Array<IncomingWebhook | OutgoingWebhook> {
    const hooks = [];

    const definitions = this.getAllDefinitions(siteId);

    for (const definition of definitions) {
      if (definition.event_id === eventId) {
        hooks.push(definition);
      }
    }

    return hooks;
  }

  async sign({ eventId, expires, siteId }: { eventId: string; expires: number; siteId: number }) {
    invariant(eventId);
    invariant(expires);

    const code = generateId();
    const key = await getPrivateKey();
    const payload = JSON.stringify({
      eventId,
      expires,
      siteId,
      code,
      created: Date.now(),
    });

    return await new CompactSign(new TextEncoder().encode(payload))
      .setProtectedHeader({ alg: 'RS256' })
      .sign(key);
  }

  async validate(eventId: string, siteId: number, jws: string) {
    const key = await getPublicKey();
    const { payload } = await compactVerify(jws, key, { algorithms: ['RS256'] });
    const decodedPayload = JSON.parse(new TextDecoder().decode(payload)) as {
      eventId: string;
      expires: number;
      created: number;
      code: string;
      siteId: number;
    };

    const time = Date.now();

    invariant(typeof decodedPayload !== 'string');
    invariant(decodedPayload.created, 'Invalid webhook');
    invariant(decodedPayload.expires, 'Invalid webhook');
    invariant(siteId === decodedPayload.siteId);
    invariant(eventId === decodedPayload.eventId, 'Invalid webhook');
    invariant(decodedPayload.created + decodedPayload.expires < time, 'Webhook has expired');

    return true;
  }
}
