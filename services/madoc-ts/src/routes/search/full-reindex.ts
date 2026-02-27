import { sql } from 'slonik';
import { api } from '../../gateway/api.server';
import { createTask as createSearchIndexTask } from '../../gateway/tasks/search-index-task';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const fullReindex: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const userApi = api.asUser({ siteId });

  const state = {
    offset: 0,
    limit: 200,
    active: true,
    tasks: [] as any[],
  };

  const ids = [];

  const task = await userApi.newTask({
    type: 'full-reindex',
    status: 2,
    name: 'Full search reindex',
    subject: `urn:madoc:site:${siteId}`,
  });

  while (state.active) {
    const responses = await context.connection.any(sql<{ resource_id: number }>`
        select resource_id
        from iiif_derived_resource idr
        where resource_type = 'manifest' and site_id = ${siteId}
        limit ${state.limit} offset ${state.offset}
    `);

    if (responses.length === 0) {
      break;
    }

    state.tasks.push(
      createSearchIndexTask(
        responses.map(r => {
          return {
            id: r.resource_id,
            type: 'manifest',
          };
        }),
        siteId,
        {
          recursive: true,
        }
      )
    );

    await userApi.addSubtasks(state.tasks, task.id);

    for (const response of responses) {
      ids.push(response.resource_id);
    }

    state.offset += state.limit;
  }

  context.response.body = task;
};
