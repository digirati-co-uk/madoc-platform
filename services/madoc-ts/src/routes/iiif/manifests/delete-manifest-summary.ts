import { sql } from 'slonik';
import { api } from '../../../gateway/api.server';
import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';

export const deleteManifestSummary: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const manifestId = context.params.id;

  const siteApi = api.asUser({ siteId });

  // Fact checking stage.
  const { site_count } = await context.connection.one(
    // This will let us know if the manifest appears on any other sites.
    // If === 1 then we can safely delete underlying resource.
    sql<{ site_count: number }>`
      select COUNT(*) as site_count from iiif_derived_resource where resource_id=${manifestId}
    `
  );

  const { canvas_distinct } = await context.connection.one(
    // This lets us know how many other manifests share canvases with this manifest.
    // If === 1 then we can safely delete all canvases.
    sql<{ canvas_distinct: number }>`
      select COUNT(distinct b.resource_id) as canvas_distinct from iiif_derived_resource_items a
        left join iiif_derived_resource_items b on a.item_id = b.item_id
        where a.resource_id = ${manifestId} and a.site_id = ${siteId}
    `
  );

  // Search
  const iiifSearchItem = await siteApi.searchGetIIIF(`urn:madoc:manifest:${manifestId}`);

  // Tasks
  const tasks = await siteApi.getTasks(0, {
    subject: `urn:madoc:manifest:${manifestId}`,
    all_tasks: true,
    all: true,
    per_page: 1,
  });
  const parentTasks = await siteApi.getTasks(0, {
    subject_parent: `urn:madoc:manifest:${manifestId}`,
    all_tasks: true,
    all: true,
    per_page: 1,
  });

  // Models?
  const models = await siteApi.getAllCaptureModels({
    target_type: 'Manifest',
    target_id: `urn:madoc:manifest:${manifestId}`,
    all_derivatives: true,
  });

  const fullDelete = site_count === 1;
  const deleteAllCanvases = canvas_distinct === 1;

  context.response.body = {
    siteCount: site_count,
    fullDelete,
    deleteAllCanvases,
    search: {
      indexed: !!iiifSearchItem,
      id: (iiifSearchItem as any)?.madoc_id,
    },
    tasks: tasks.pagination.totalResults,
    parentTasks: parentTasks.pagination.totalResults,
    models: models.length,
  };
};
