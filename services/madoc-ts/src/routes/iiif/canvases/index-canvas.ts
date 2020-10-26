import { api } from '../../../gateway/api.server';
import { RouteMiddleware } from '../../../types/route-middleware';
import { SearchIngestRequest } from '../../../types/search';
import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { getParentResources } from '../../../database/queries/resource-queries';

export const indexCanvas: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, siteUrn } = optionalUserWithScope(context, []);
  const userApi = api.asUser({ siteId });
  const canvasId = Number(context.params.id);

  const { canvas } = await userApi.getCanvasById(canvasId);

  const manifestsWithin = await context.connection.any(getParentResources(canvasId as any, siteId));
  const searchPayload: SearchIngestRequest = {
    id: `urn:madoc:canvas:${canvasId}`,
    type: 'Canvas',
    resource: {
      type: 'Canvas',
      id: `http://madoc.dev/urn:madoc:canvas:${canvasId}`,
      label: canvas.label as any,
      thumbnail: canvas.thumbnail as any,
      summary: canvas.summary,
      metadata: canvas.metadata,
      rights: (canvas as any).rights,
      provider: (canvas as any).provider,
      requiredStatement: canvas.requiredStatement,
      navDate: (canvas as any).navDate,
    },
    thumbnail: canvas.thumbnail as string,
    contexts: [
      { id: siteUrn, type: 'Site' },
      // Should this be contexts or manifests here? Do canvases have site contexts too?
      ...manifestsWithin.map(({ resource_id }) => {
        return { id: `urn:madoc:manifest:${resource_id}`, type: 'Manifest' };
      }),
      {
        id: `urn:madoc:canvas:${canvasId}`,
        type: 'Canvas',
      },
    ],
  };

  try {
    await api.searchGetIIIF(`urn:madoc:canvas:${canvasId}`);

    await userApi.searchReIngest(searchPayload);
  } catch (err) {
    await userApi.searchIngest(searchPayload);
  }

  context.response.body = canvas;
};
