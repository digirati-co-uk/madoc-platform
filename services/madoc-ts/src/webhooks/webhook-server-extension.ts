import { stringify } from 'query-string';
import invariant from 'tiny-invariant';
import { RegistryExtension } from '../extensions/registry-extension';
import { generateId } from '../frontend/shared/capture-models/helpers/generate-id';
import { apiGateway, gatewayHost } from '../gateway/api.server';
import { manifestEnrichmentHook } from '../routes/enrichment/manifest-enrichment-pipeline';
import { getPem, getPublicPem } from '../utility/get-pem';
import { IncomingWebhook, OutgoingWebhook } from './webhook-types';
import { JWK, JWS } from 'jose';

export class WebhookServerExtension extends RegistryExtension<IncomingWebhook | OutgoingWebhook> {
  constructor() {
    super({
      registryName: 'webhook',
    });

    WebhookServerExtension.register(manifestEnrichmentHook);

    WebhookServerExtension.register({
      is_outgoing: false,
      type: 'example-test',
      event_id: 'test-event',
      execute: body => {
        console.log('WebHooks - test event:', body);
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
    const key = JWK.asKey(getPem());
    const sig = JWS.sign.flattened(
      {
        eventId,
        expires,
        siteId,
        code,
        created: Date.now(),
      },
      key
    );

    return `${sig.protected}.${sig.payload}.${sig.signature}`;
  }

  async validate(eventId: string, siteId: number, jws: string) {
    const payload = (await JWS.verify(jws, getPublicPem())) as {
      eventId: string;
      expires: number;
      created: number;
      code: string;
      siteId: number;
    };

    const time = Date.now();

    invariant(typeof payload !== 'string');
    invariant(payload.created, 'Invalid webhook');
    invariant(payload.expires, 'Invalid webhook');
    invariant(siteId === payload.siteId);
    invariant(eventId === payload.eventId, 'Invalid webhook');
    invariant(payload.created + payload.expires < time, 'Webhook has expired');

    return true;
  }
}
