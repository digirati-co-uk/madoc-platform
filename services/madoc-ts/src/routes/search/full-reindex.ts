import { api } from '../../gateway/api.server';
import { createTask } from '../../gateway/tasks/full-reindex-task';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const fullReindex: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const userApi = api.asUser({ siteId });
  context.disposableApis.push(userApi);

  context.response.body = await userApi.newTask(createTask(siteId));
};
