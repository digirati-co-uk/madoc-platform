import { RouteMiddleware } from '../../types/route-middleware';
import { api } from '../../gateway/api.server';
import { userWithScope } from '../../utility/user-with-scope';
import { RequestError } from '../../utility/errors/request-error';

export const assignReview: RouteMiddleware<{ id: string }, { task_id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const { id } = context.params;
  const { task_id } = context.request.body;
  const userApi = api.asUser({ siteId });

  if (!task_id) {
    throw new RequestError('Invalid task.');
  }
  const project = await userApi.getProject(id);
  const task = await userApi.getTaskById(task_id);

  if (task.root_task !== project.task_id) {
    throw new RequestError('Task is not part of project');
  }

  context.response.body = {
    task,
  };
};
