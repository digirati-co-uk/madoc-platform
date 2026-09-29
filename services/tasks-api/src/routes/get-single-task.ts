import { RouteMiddleware } from '../types';
import { getTask } from '../database/get-task';
import { castStringBool } from '../utility/cast-string-bool';

export const getSingleTask: RouteMiddleware<{ id: string }> = async (context) => {
  const assignee = Boolean(context.query.assignee);
  context.response.body = await getTask(context.connection, {
    context: context.state.jwt.context,
    user: context.state.jwt.user,
    id: context.params.id,
    scope: context.state.jwt.scope,
    status: context.query.status ? Number(context.query.status) : undefined,
    page: Number(context.query.page || 1),
    all: castStringBool(context.query.all),
    subtaskFields: assignee ? ['assignee'] : [],
    subjects: Array.isArray(context.query.subjects)
      ? context.query.subjects
      : context.query.subjects
      ? [context.query.subjects as string]
      : [],
    rootStatistics: castStringBool(context.query.root_statistics),
  });
};
