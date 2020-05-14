import { RouteMiddleware } from '../types';
import { getTask } from '../database/get-task';

export const getSingleTask: RouteMiddleware<{ id: string }> = async context => {
  context.response.body = await getTask(context.connection, {
    context: context.state.jwt.context,
    user: context.state.jwt.user,
    id: context.params.id,
    scope: context.state.jwt.scope,
    status: context.query.status ? Number(context.query.status) : undefined,
    page: Number(context.query.page || 1),
    all: Boolean(context.query.all),
  });
};
