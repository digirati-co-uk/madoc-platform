import { sql } from 'slonik';
import { userWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import {
  getManifestSnippets,
  getSingleManifest,
  mapManifestSnippets,
} from '../../../database/queries/get-manifest-snippets';
import { ManifestFull } from '../../../types/schemas/manifest-full';

// @todo come back to group by for multiple scopes.
// @todo manifest thumbnail from canvas
// @todo return all canvases - paginated.
export const getManifest: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, []);
  const manifestId = Number(context.params.id);

  const canvasesPerPage = 24;
  const { total = 0 } = (await context.connection.maybeOne<{ total: number }>(sql`
      select item_total as total
          from iiif_derived_resource_item_counts
          where resource_id = ${manifestId}
          and site_id = ${siteId}
  `)) || { total: 0 };
  const totalPages = Math.ceil(total / canvasesPerPage) || 1;
  const requestedPage = Number(context.query.page) || 1;
  const page = requestedPage < totalPages ? requestedPage : totalPages;

  const rows = await context.connection.any(
    getManifestSnippets(
      getSingleManifest({
        manifestId,
        siteId: Number(siteId),
        perPage: canvasesPerPage,
        page,
      }),
      {
        siteId: Number(siteId),
        fields: ['label'],
        allManifestFields: true,
      }
    )
  );

  const table = mapManifestSnippets(rows);

  const manifest = table.manifests[`${manifestId}`];
  const canvasIds = table.manifest_to_canvas[`${manifestId}`] || [];
  manifest.items = canvasIds.map((id: number) => table.canvases[id]);

  context.response.body = {
    manifest,
    pagination: {
      page,
      totalResults: total,
      totalPages,
    },
  } as ManifestFull;
};
