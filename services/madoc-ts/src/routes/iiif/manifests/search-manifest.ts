import { RouteMiddleware } from '../../../types/route-middleware';
import { sql } from 'slonik';
import { SearchServiceSearchResponse } from '@hyperion-framework/types';

const gatewayHost = process.env.GATEWAY_HOST || 'http://localhost:8888';

export const searchManifest: RouteMiddleware<{ id: number }> = async context => {
  const { siteApi } = context.state;

  const manifestUrn = `urn:madoc:manifest:${context.params.id}`;

  const { q, field_type, selector_type, parent_property, capture_model_id, source_id } = context.request.query;

  if (!q) {
    context.response.body = {
      '@context': 'http://iiif.io/api/presentation/3/context.json',
      '@id': `${gatewayHost}${context.path}`,
      '@type': 'sc:AnnotationList',
      resources: [],
    };
    return;
  }

  const response = await siteApi.searchPublishedModelFields({ manifest: manifestUrn }, q, {
    field_type,
    selector_type,
    capture_model_id,
    parent_property,
  });

  // 0. Filter out all of the empty selectors? maybe.
  // 1. Get list of all of the canvas ids.
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

  // 2. Make query to madoc db for all of the data we need about the canvas
  // 3. Build up annotation list
  // 4. Possible autocomplete and stemming on field type
  // 5. Possible hits integration.

  context.set('Access-Control-Allow-Origin', '*');

  const searchResponse: SearchServiceSearchResponse = {
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    '@id': `${gatewayHost}${context.path}`,
    '@type': 'sc:AnnotationList',
    resources: response.results.map(result => {
      const selector = result.selector ? result.selector : result.parent_selector;
      return {
        '@id': `${gatewayHost}${context.path}/resources/${result.id}`,
        '@type': 'oa:Annotation',
        motivation: 'sc:painting',
        resource: {
          '@type': 'cnt:ContentAsText',
          chars: result.value,
        },
        on: selector
          ? `${sourceMap[result.canvas]}#xywh=${~~selector.x},${~~selector.y},${~~selector.width},${~~selector.height}`
          : sourceMap[result.canvas],
      };
    }),
  };

  context.response.body = searchResponse;
};
