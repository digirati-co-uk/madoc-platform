import { api } from '../../gateway/api.server';
import { createTask as createSearchIndexTask } from '../../gateway/tasks/search-index-task';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const batchIndex: RouteMiddleware<
  {},
  { resources: Array<{ id: number; type: string }>; config: any }
> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const userApi = api.asUser({ siteId });
  const { resources, config } = context.requestBody;

  context.response.body = await userApi.newTask(createSearchIndexTask(resources, siteId, config));
};
