import { ApiRequest } from '../../gateway/api-definitions/_meta';
import { runApiRequest } from '../../gateway/api-definitions/_run';
import { api } from '../../gateway/api.server';
import { ApiActionTask } from '../../gateway/tasks/api-action-task';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { optionalUserWithScope, userWithScope } from '../../utility/user-with-scope';
import * as apiActionTask from '../../gateway/tasks/api-action-task';

export const delegatedRequest: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, id, name } = userWithScope(context, ['site.admin']);
  const taskId = context.params.id;
  const userApi = api.asUser({ userId: id, siteId, userName: name }, {}, true);
  context.disposableApis.push(userApi);

  const task = await userApi.getTask<ApiActionTask>(taskId, { detail: true });

  if (!task || task.type !== apiActionTask.type) {
    throw new NotFound();
  }

  const details = task?.parameters ? task?.parameters[0] : null;
  const request = details?.request;

  if (!request) {
    throw new NotFound();
  }

  await userApi.updateTask<ApiActionTask>(taskId, {
    status: 2,
    status_text: apiActionTask.status[2],
  });

  const response = await runApiRequest(userApi, request);

  if (!response.success) {
    await userApi.updateTask<ApiActionTask>(taskId, {
      status: -1,
      status_text: 'error',
      state: {
        didError: true,
        errorMessage: (response.errors || []).join('\n'),
      },
    });
  } else {
    await userApi.updateTask<ApiActionTask>(taskId, {
      status: 3,
      status_text: apiActionTask.status[3],
    });
  }

  // Even if there are errors, the running was a "success".
  context.response.status = 200;
  context.response.body = response;
};

export const createDelegatedRequest: RouteMiddleware<{}, ApiRequest<any, any>> = async context => {
  // @todo this will need revised, but I think it makes sense that contributors can also request.
  const { siteId, id, name } = userWithScope(context, ['models.contribute']);

  const request = context.requestBody;
  const subject = context.query.subject;
  const userApi = api.asUser({ userId: id, siteId, userName: name });

  const task = await userApi.newTask(apiActionTask.createTask(request, id, siteId, subject, request.summary));

  context.response.status = 200;
  context.response.body = task;
};

export const assignUserToDelegatedRequest: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.admin']);

  const taskId = context.params.id;

  const users = await context.siteManager.getUsersByRoles(siteId, ['admin'], true);

  const siteApi = api.asUser({ siteId });
  const first = users[0];

  const task = await siteApi.getTask(taskId);

  if (task.type !== apiActionTask.type) {
    throw new NotFound();
  }

  if (first) {
    await siteApi.assignUserToTask(taskId, {
      id: `urn:madoc:user:${first.id}`,
      name: first.name,
    });
  }

  context.response.status = 200;
};
