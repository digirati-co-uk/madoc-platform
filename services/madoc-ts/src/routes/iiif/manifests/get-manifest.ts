import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import {
  getManifestSnippets,
  getSingleManifest,
  mapManifestSnippets,
} from '../../../database/queries/get-manifest-snippets';
import { ManifestFull } from '../../../types/schemas/manifest-full';
import { getResourceCount } from '../../../database/queries/count-queries';

export const getManifest: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.read']);
  const manifestId = Number(context.params.id);

  const canvasesPerPage = 28;
  const excludeCanvases = context.query.excluded;
  const excluded = Array.isArray(excludeCanvases)
    ? excludeCanvases
    : excludeCanvases
    ? excludeCanvases.split(',')
    : undefined;
  const { total = 0 } = (await context.connection.maybeOne(getResourceCount(manifestId, siteId))) || { total: 0 };
  const adjustedTotal = excluded ? total - excluded.length : total;
  const totalPages = Math.ceil(adjustedTotal / canvasesPerPage) || 1;
  const requestedPage = Number(context.query.page) || 1;
  const page = requestedPage < totalPages ? requestedPage : totalPages;

  const rows = await context.connection.any(
    getManifestSnippets(
      getSingleManifest({
        manifestId,
        siteId: Number(siteId),
        perPage: canvasesPerPage,
        page,
        excludeCanvases: excluded,
      }),
      {
        siteId: Number(siteId),
        fields: ['label'],
        allManifestFields: true,
      }
    )
  );

  const table = mapManifestSnippets(rows);

  const manifest = table.manifests[`${manifestId}`] || {
    id: manifestId,
    label: { '@none': ['Untitled manifest'] },
  };
  const canvasIds = table.manifest_to_canvas[`${manifestId}`] || [];
  manifest.items = canvasIds.map((id: number) => table.canvases[id]);

  context.response.body = {
    manifest,
    pagination: {
      page,
      totalResults: adjustedTotal,
      totalPages,
    },
  } as ManifestFull;
};
