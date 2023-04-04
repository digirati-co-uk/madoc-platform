import invariant from 'tiny-invariant';
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { parseUrn } from '../../utility/parse-urn';
import { userWithScope } from '../../utility/user-with-scope';
import { IncomingWebhook, WebhookEventType } from '../../webhooks/webhook-types';

export const manifestEnrichmentPipeline: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const site = await context.siteManager.getSiteById(siteId);
  const siteApi = api.asUser({ siteId });

  // 12-hour token.
  const webhook = await context.webhookExtension.generateWebhookUrl(
    site,
    manifestEnrichmentPipelineEvent.event_id,
    12 * 3600,
    true
  );
  context.response.body = await siteApi.enrichment.enrichManifestInternal(context.params.id, webhook);
};

export const manifestEnrichmentPipelineEvent: WebhookEventType = {
  event_id: 'manifest-enrichment-pipeline.complete',
  body_variables: ['id'],
};

export const manifestEnrichmentHook: IncomingWebhook = {
  type: 'manifest-enrichment-pipeline-task-ingest',
  event_id: 'manifest-enrichment-pipeline.complete',
  is_outgoing: false,
  execute: async (resp, siteApi) => {
    invariant(resp.id, 'Expected response to contain `id`');

    const task = await siteApi.enrichment.getEnrichmentTask(resp.id);
    invariant(task.subject, 'Missing subject on task');
    invariant(task.status === 3, 'Task is not yet complete');

    if (task.task_type === 'ocr_madoc_resource') {
      const parsed = parseUrn(task.subject);
      invariant(parsed, 'Invalid subject');
      invariant(parsed.type === 'canvas', 'Can only process canvases');

      if (task.state && task.state.ocr_resources && task.state.ocr_resources[0]) {
        const first = task.state.ocr_resources[0];
        const enrichmentPlaintext = await siteApi.enrichment.getEnrichmentPlaintext(first);
        invariant(enrichmentPlaintext, 'Missing plaintext from enrichment');
        if (enrichmentPlaintext.plaintext) {
          const canvasId = parsed.id; // ??
          return await siteApi.updateCanvasPlaintext(canvasId, enrichmentPlaintext.plaintext);
        }
      }
    }
  },
};
