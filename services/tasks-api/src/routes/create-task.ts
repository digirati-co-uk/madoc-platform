import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import { CreateTask } from '../schemas/CreateTask';
import { v4 } from 'uuid';
import { insertTask } from '../database/insert-task';

export const createTask: RouteMiddleware<{}, CreateTask> = async (context, next) => {
  const isAdmin = context.state.jwt.scope.indexOf('tasks.admin') !== -1;
  const canCreate = isAdmin || context.state.jwt.scope.indexOf('tasks.create') !== -1;
  const task = context.requestBody;

  if (!canCreate) {
    throw new NotFound();
  }

  const id = v4();
  await insertTask(context.connection, {
    id,
    task,
    user: context.state.jwt.user,
    context: context.state.jwt.context,
  });

  // @todo change this to return the task.
  context.redirect(context.routes.url('get-single-task', { id }));
};
