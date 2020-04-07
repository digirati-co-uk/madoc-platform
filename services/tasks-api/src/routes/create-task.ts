import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import { CreateTask } from '../schemas/CreateTask';
import { v4 } from 'uuid';
import { insertTask } from '../database/insert-task';
import { RequestError } from '../errors/request-error';
import { validateEvents } from '../utility/events';

export const createTask: RouteMiddleware<{}, CreateTask> = async (context, next) => {
  const isAdmin = context.state.jwt.scope.indexOf('tasks.admin') !== -1;
  const canCreate = isAdmin || context.state.jwt.scope.indexOf('tasks.create') !== -1;
  const task = context.requestBody;

  if (!canCreate) {
    throw new NotFound();
  }

  if (task.queue_id && context.state.queueList.indexOf(task.queue_id) === -1) {
    throw new RequestError(`Queue ${task.queue_id} does not exist`);
  }

  if (task.events) {
    task.events = validateEvents(task.events);
  }

  const id = v4();
  await insertTask(context.connection, {
    id,
    task,
    user: context.state.jwt.user,
    context: context.state.jwt.context,
  });

  // Task events
  const taskWithId = { id, ...task };
  context.state.dispatch(taskWithId, 'created');
  if (task.assignee) {
    context.state.dispatch(taskWithId, 'assigned', undefined, task.assignee);
    context.state.dispatch(taskWithId, 'assigned_to', task.assignee.id, task.assignee);
  }
  if (typeof task.status !== 'undefined') {
    context.state.dispatch(taskWithId, 'status', task.status, { status_text: task.status_text });
  }

  context.response.status = 201;
};
