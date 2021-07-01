import { sql } from 'slonik';
import { api } from '../../../gateway/api.server';
import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';

export const getCollectionDeletionSummary: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const collectionId = context.params.id;

  const siteApi = api.asUser({ siteId });

  // Fact checking stage.
  const { site_count } = await context.connection.one(
    // This will let us know if the collection appears on any other sites.
    // If === 1 then we can safely delete underlying resource.
    sql<{ site_count: number }>`
      select COUNT(*) as site_count from iiif_derived_resource where resource_id=${collectionId}
    `
  );

  // Search
  const iiifSearchItem = await siteApi.searchGetIIIF(`urn:madoc:collection:${collectionId}`);

  // Tasks
  const tasks = await siteApi.getTasks(0, {
    subject: `urn:madoc:collection:${collectionId}`,
    all_tasks: true,
    all: true,
    per_page: 1,
  });
  const parentTasks = await siteApi.getTasks(0, {
    subject_parent: `urn:madoc:collection:${collectionId}`,
    all_tasks: true,
    all: true,
    per_page: 1,
  });

  const fullDelete = site_count === 1;

  context.response.body = {
    siteCount: site_count,
    fullDelete,
    search: {
      indexed: !!iiifSearchItem,
      id: (iiifSearchItem as any)?.madoc_id,
    },
    tasks: tasks.pagination.totalResults,
    parentTasks: parentTasks.pagination.totalResults,
  };
};
