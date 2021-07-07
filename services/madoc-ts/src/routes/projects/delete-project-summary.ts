import { sql } from 'slonik';
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const deleteProjectSummary: RouteMiddleware<{ id: number }> = async context => {
  const {siteId} = userWithScope(context, ['site.admin']);
  const projectId = context.params.id;

  const siteApi = api.asUser({siteId});

  // Fact checking stage.
  const { site_count } = await context.connection.one(
    // This will let us know if the manifest appears on any other sites.
    // If === 1 then we can safely delete underlying resource.
    sql<{ site_count: number; manifest_count: number }>`
      select COUNT(distinct site_id) as site_count from iiif_derived_resource where resource_id=${projectId}
    `
  );

  const project = await siteApi.getProject(projectId);
  const { collection_count } = await context.connection.one(
    sql<{ collection_count: number }>`
      select COUNT(*) as collection_count from iiif_derived_resource
        where
          id in (select item_id from iiif_derived_resource_items where resource_id = ${project.collection_id})
        and resource_type = 'collection'
    `
  );
  const { manifest_count } = await context.connection.one(
    sql<{ manifest_count: number }>`
      select COUNT(*) as manifest_count from iiif_derived_resource
        where
          id in (select item_id from iiif_derived_resource_items where resource_id = ${project.collection_id})
        and resource_type = 'manifest'
    `
  );

  // Search
  const iiifSearchItem = await siteApi.searchGetIIIF(`urn:madoc:project:${projectId}`);

  // Tasks
  const tasks = await siteApi.getTasks(0, {
    subject: `urn:madoc:project:${projectId}`,
    all_tasks: true,
    all: true,
    per_page: 1,
  });
  const parentTasks = await siteApi.getTasks(0, {
    subject_parent: `urn:madoc:project:${projectId}`,
    all_tasks: true,
    all: true,
    per_page: 1,
  });

  context.response.body = {
    siteCount: site_count,
    collectionCount: collection_count,
    manifestCount: manifest_count,
    search: {
      indexed: !!iiifSearchItem,
      id: (iiifSearchItem as any)?.madoc_id,
    },
    tasks: tasks.pagination.totalResults,
    parentTasks: parentTasks.pagination.totalResults,
  };

};