import { ApiClientWithoutExtensions } from '../../gateway/api';
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { CaptureModelSnippet } from '../../types/schemas/capture-model-snippet';
import { userWithScope } from '../../utility/user-with-scope';
import * as migrationTasks from './migrate-model-task';

// Required old apis
function getAllCaptureModels(userApi: ApiClientWithoutExtensions, page: number) {
  return userApi.request<CaptureModelSnippet[]>(`/api/crowdsourcing/model?all_derivatives=true&page=${page}`);
}

export const modelApiMigrationStart: RouteMiddleware = async context => {
  const { siteId, id } = userWithScope(context, ['site.admin']);

  try {
    const userApi = api.asUser({ siteId, userId: id });

    const baseTask = await userApi.newTask(migrationTasks.createContainerTask(siteId));
    const subTaskGroups: any[][] = [];
    let subTasks = [];

    // Looks like the paging is broken on the model service..
    const allModels = await getAllCaptureModels(userApi, 0);
    for (const model of allModels) {
      subTasks.push(migrationTasks.createTask(model.id, siteId));

      if (subTasks.length === 100) {
        subTaskGroups.push(subTasks);
        subTasks = [];
      }
    }

    let added = false;
    subTaskGroups.push(subTasks);

    for (const group of subTaskGroups) {
      if (group.length) {
        added = true;
        await userApi.addSubtasks(group, baseTask.id);
      }
    }

    if (!added) {
      await userApi.deleteTask(baseTask.id);
      context.response.body = { complete: true };
      return;
    }

    // OK So we need to get all capture models.
    // For each capture model, we need to check which site its in, and then import it.
    context.response.body = await userApi.getTask(baseTask.id);
  } catch (e) {
    context.response.body = { err: e.toString() };
    context.response.status = 500;
  }
};
