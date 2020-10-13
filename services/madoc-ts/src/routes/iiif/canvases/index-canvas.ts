import { sql } from 'slonik';
import {
  getManifestSnippets,
  getSingleManifest,
  mapManifestSnippets,
} from '../../../database/queries/get-manifest-snippets';
import { api } from '../../../gateway/api.server';
import { RouteMiddleware } from '../../../types/route-middleware';
import { optionalUserWithScope } from '../../../utility/user-with-scope';

export const indexCanvas: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, siteUrn } = optionalUserWithScope(context, []);
  const userApi = api.asUser({ siteId });
  const canvasId = Number(context.params.id);

  //  NEED TO WORK OUT WHAT TO DO HERE INSTEAD. WE WANT TO BE ABLE TO GET A SINGLE CANVAS OUT.
  const rows = await context.connection.any(
    getManifestSnippets(
      getSingleManifest({
        canvasId,
        siteId: Number(siteId),
        perPage: 1,
        page: 1,
        excludeCanvases: [],
      }),
      {
        siteId: Number(siteId),
        fields: ['label'],
        allManifestFields: true,
      }
    )
  );

  const table = mapManifestSnippets(rows);

  if (!table.canvases[`${canvasId}`]) {
    return; // no metadata to index.
  }

  const collectionsWithin = await context.connection.any<{ resource_id: number }>(
    sql`select cols.resource_id from iiif_derived_resource_items cols
        left join iiif_derived_resource ir on ir.resource_id = cols.resource_id
        where item_id = ${canvasId} and cols.site_id = ${Number(siteId)} and ir.flat = false`
  );

  const manifest = table.canvases[`${canvasId}`];

  const searchPayload = {
    id: `urn:madoc:canvas:${canvasId}`,
    type: 'Canvas',
    resource: {
      ...manifest,
      id: `http://madoc.dev/urn:madoc:canvas:${canvasId}`,
      type: 'Canvas',
    },
    thumbnail: manifest.thumbnail,
    contexts: [
      { id: siteUrn, type: 'Site' },
      ...collectionsWithin.map(({ resource_id }) => {
        return { id: `urn:madoc:collection:${resource_id}`, type: 'Collection' };
      }),
      {
        id: `urn:madoc:canvas:${canvasId}`,
        type: 'Canvas',
      },
    ],
  };

  try {
    await userApi.searchIngest(searchPayload);
    const alreadyIndexed = (await api.getIndexedCanvasById(`urn:madoc:canvas:${canvasId}`)).results.length > 0;
    if (alreadyIndexed) {
      await userApi.searchReIngest(searchPayload);
    } else {
      await userApi.searchIngest(searchPayload);
    }
  } catch (e) {
    console.log(e);
  }

  context.response.body = table.canvases[`${canvasId}`];
};
