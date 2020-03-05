import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import { CreateTask } from '../schemas/CreateTask';
import { RequestError } from '../errors/request-error';
import { v4 } from 'uuid';
import { insertTask } from '../database/insert-task';

export const createSubtask: RouteMiddleware<{ id: string }, CreateTask> = async context => {
  const task = context.requestBody;
  const parentId = context.params.id;
  const isAdmin = context.state.jwt.scope.indexOf('tasks.admin') !== -1;
  const canCreate = isAdmin || context.state.jwt.scope.indexOf('tasks.create') !== -1;

  if (!canCreate) {
    throw new NotFound();
  }

  if (task.parent_task && task.parent_task !== parentId) {
    throw new RequestError('Parent task provided does not match');
  }

  // Override the parent task.
  task.parent_task = parentId;

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
