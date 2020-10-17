import { sql } from 'slonik';
import { api } from '../../../gateway/api.server';
import { RouteMiddleware } from '../../../types/route-middleware';
import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { getParentResources } from '../../../database/queries/resource-queries';
import { mapMetadata, MetadataField } from '../../../utility/iiif-metadata';

export const indexCanvas: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, siteUrn } = optionalUserWithScope(context, []);
  const userApi = api.asUser({ siteId });
  const canvasId = Number(context.params.id);

  const canvases = await context.connection.any<MetadataField>(sql`
    select
            ifd.resource_id,
            ifd.created_at,
            im.key,
            im.value,
            im.language,
            im.source from iiif_derived_resource ifd
        left outer join iiif_metadata im on ifd.resource_id = im.resource_id
    where ifd.site_id ~ ${siteId}
    and ifd.resource_type = 'canvas'
    and im.key = 'label'
    and im.site_id = ${siteId}
    group by ifd.resource_id, ifd.created_at, im.key, im.value, im.language, im.source
    `);

  const canvas = mapMetadata(canvases)[0];

  const manifestsWithin = await context.connection.any(
    getParentResources(`http://madoc.dev/urn:madoc:canvas:${canvasId}`, siteId)
  );

  const searchPayload = {
    id: `urn:madoc:canvas:${canvasId}`,
    type: 'Canvas',
    resource: {
      id: `http://madoc.dev/urn:madoc:canvas:${canvasId}`,
      type: 'Canvas',
      ...canvas,
    },
    thumbnail: canvas.default_thumbnail,
    contexts: [
      { id: siteUrn, type: 'Site' },
      ...manifestsWithin.map(({ resource_id }) => {
        return { id: `urn:madoc:manifests:${resource_id}`, type: 'Manifests' };
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

  context.response.body = canvas;
};
