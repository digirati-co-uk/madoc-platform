import { RouteMiddleware } from '../../../types/route-middleware';
import { sql } from 'slonik';
import { SearchServiceSearchResponse } from '@iiif/presentation-3';
import { gatewayHost } from '../../../gateway/api.server';

export const searchManifest: RouteMiddleware<{ id: number }> = async context => {
  const { siteApi } = context.state;

  const manifestUrn = `urn:madoc:manifest:${context.params.id}`;

  const {
    q,
    canvas_id,
    field_type,
    selector_type,
    parent_property,
    capture_model_id,
    source_id,
  } = context.request.query;

  const canvasUrn = canvas_id ? `urn:madoc:canvas:${canvas_id}` : undefined;

  if (!q && !canvas_id) {
    context.response.body = {
      '@context': 'http://iiif.io/api/presentation/3/context.json',
      '@id': `${gatewayHost}${context.path}`,
      '@type': 'sc:AnnotationList',
      resources: [],
    };
    return;
  }

  const response = await siteApi.crowdsourcing.searchPublishedModelFields(
    canvasUrn ? { canvas: canvasUrn } : { manifest: manifestUrn },
    q,
    {
      field_type,
      selector_type,
      capture_model_id,
      parent_property,
    }
  );

  const canvasIds: string[] = [];

  for (const result of response.results) {
    if (canvasIds.indexOf(result.canvas) === -1) {
      canvasIds.push(result.canvas);
    }
  }

  const sources = await context.connection.any(sql<{ id: number; source: string }>`
    select id, source from iiif_resource where 'urn:madoc:canvas:' || id = any (${sql.array(canvasIds, 'text')})
  `);

  const sourceMap: { [id: string]: string } = {};

  for (const source of sources) {
    sourceMap[`urn:madoc:canvas:${source.id}`] = source.source;
  }

  context.set('Access-Control-Allow-Origin', '*');

  const searchResponse: SearchServiceSearchResponse = {
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    '@id': `${gatewayHost}${context.path}`,
    '@type': 'sc:AnnotationList',
    resources: response.results
      .map(result => {
        const selector = result.selector ? result.selector : result.parent_selector;
        if (!selector || !result.value) {
          return false as any;
        }
        return {
          '@id': `${gatewayHost}${context.path}/resources/${result.id}`,
          '@type': 'oa:Annotation',
          motivation: 'sc:painting',
          resource: {
            '@type': 'cnt:ContentAsText',
            chars: result.value,
          },
          'madoc:id': result.canvas,
          on: selector
            ? `${
                sourceMap[result.canvas]
              }#xywh=${~~selector.x},${~~selector.y},${~~selector.width},${~~selector.height}`
            : sourceMap[result.canvas],
        };
      })
      .filter(e => e),
  };

  context.response.body = searchResponse;
};
