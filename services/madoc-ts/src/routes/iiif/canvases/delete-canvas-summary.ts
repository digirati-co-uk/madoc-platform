import { sql } from 'slonik';
import { api } from '../../../gateway/api.server';
import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';

export const deleteCanvasSummary: RouteMiddleware<{ id: number }> = async context => {
  const {siteId} = userWithScope(context, ['site.admin']);
  const canvasId = context.params.id;

  const siteApi = api.asUser({siteId});

  // Fact checking stage.
  const { site_count, manifest_count } = await context.connection.one(
    // This will let us know if the manifest appears on any other sites.
    // If === 1 then we can safely delete underlying resource.
    // TODO can a canvas appear in multiple manifests on the same site?
    sql<{ site_count: number; manifest_count: number }>`
      select COUNT(distinct site_id) as site_count, COUNT(*) as manifest_count from iiif_derived_resource where resource_id=${canvasId}
    `
  );

  // Search
  const iiifSearchItem = await siteApi.searchGetIIIF(`urn:madoc:canvas:${canvasId}`);

  // TODO doesn't look like canvas tasks have predicatble subjects...
  // Tasks
  const tasks = await siteApi.getTasks(0, {
    subject: `urn:madoc:canvas:${canvasId}`,
    all_tasks: true,
    all: true,
    per_page: 1,
  });
  const parentTasks = await siteApi.getTasks(0, {
    subject_parent: `urn:madoc:canvas:${canvasId}`,
    all_tasks: true,
    all: true,
    per_page: 1,
  });

  context.response.body = {
    siteCount: site_count,
    manifestCount: manifest_count,
    search: {
      indexed: !!iiifSearchItem,
      id: (iiifSearchItem as any)?.madoc_id,
    },
    tasks: tasks.pagination.totalResults,
    parentTasks: parentTasks.pagination.totalResults,
  };

};