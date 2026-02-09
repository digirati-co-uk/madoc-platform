import { sql } from 'slonik';
import { api } from '../../gateway/api.server';
import { BaseTask } from '../../gateway/tasks/base-task';
import { createTask as createSearchIndexTask } from '../../gateway/tasks/search-index-task';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

const SEARCH_INDEX_TASK_TYPE = 'search-index-task';
const TASK_PAGE_SIZE = 200;
const MAX_TASK_PAGES = 100;

async function getTopLevelSearchTaskIds(userApi: ReturnType<typeof api.asUser>) {
  const taskIds = new Set<string>();
  let page = 1;

  while (page <= MAX_TASK_PAGES) {
    const response = await userApi.getTasks<BaseTask>(page, {
      all_tasks: true,
      type: SEARCH_INDEX_TASK_TYPE,
      per_page: TASK_PAGE_SIZE,
    });

    for (const task of response.tasks || []) {
      if (!task?.id || task.parent_task) {
        continue;
      }
      taskIds.add(task.id);
    }

    const totalPages = Number(response.pagination?.totalPages || page);
    if (page >= totalPages) {
      break;
    }

    page += 1;
  }

  return [...taskIds];
}

export const fullReindex: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const userApi = api.asUser({ siteId });

  const existingTopLevelSearchTaskIds = await getTopLevelSearchTaskIds(userApi);
  for (const taskId of existingTopLevelSearchTaskIds) {
    try {
      await userApi.deleteTask(taskId);
    } catch {
      // Best effort cleanup before creating a new full reindex task.
    }
  }

  const state = {
    offset: 0,
    limit: 200,
    active: true,
  };

  const task = await userApi.newTask({
    type: 'full-reindex',
    status: 2,
    name: 'Full search reindex',
    subject: `urn:madoc:site:${siteId}`,
  });

  while (state.active) {
    const responses = await context.connection.any(sql<{ id: number }>`
        select resource_id as id
        from iiif_derived_resource idr
        where resource_type = 'manifest' and site_id = ${siteId}
        limit ${state.limit} offset ${state.offset}
    `);

    if (responses.length === 0) {
      break;
    }

    const batchTasks = [
      createSearchIndexTask(
        responses.map(r => {
          return {
            id: r.id,
            type: 'manifest',
          };
        }),
        siteId,
        {
          recursive: false,
        }
      ),
    ];

    await userApi.addSubtasks(batchTasks, task.id);

    state.offset += state.limit;
  }

  context.response.body = task;
};
