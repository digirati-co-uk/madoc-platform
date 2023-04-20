import { api } from '../../gateway/api.server';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { RouteMiddleware } from '../../types/route-middleware';
import { CrowdsourcingTask } from '../../gateway/tasks/crowdsourcing-task';
export const updateRevisionTask: RouteMiddleware<{ taskId: string; task: any }> = async context => {
  const { siteId } = optionalUserWithScope(context, []);
  const userApi = api.asUser({ siteId });
  const id = context.params.taskId;
  const taskBody = context.requestBody.task;

  if (!id) {
    throw new Error('Task could not be updated');
  }

  if (!taskBody) {
    throw new Error('Task could not be updated, no body');
  }
  await userApi.updateTask<CrowdsourcingTask>(id, taskBody);
  context.response.status = 200;
};
