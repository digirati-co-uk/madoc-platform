import { RouteMiddleware } from '../../types/route-middleware';

export const siteTaskMetadata: RouteMiddleware = async context => {
  const { siteApi } = context.state;

  const task = await siteApi.getTask(context.params.taskId);

  // Do we need to update the metadata.
  if (siteApi.tasks.requiresUpdate(task)) {
    const newMetadata = await siteApi.tasks.remoteMetadata(task, false);
    const updatedTask = await siteApi.tasks.updateTaskMetadata(task.id, newMetadata);

    context.response.body = updatedTask.metadata;
    context.response.status = 200;
    return;
  }

  context.response.body = task.metadata;
  context.response.status = 200;
};
