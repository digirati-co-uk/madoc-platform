import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import { CreateTask } from '../schemas/CreateTask';
import { RequestError } from '../errors/request-error';
import { v4 } from 'uuid';
import { insertTask } from '../database/insert-task';
import { getTask } from '../database/get-task';
import {validateEvents} from '../utility/events';

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

  if (task.queue_id && context.state.queueList.indexOf(task.queue_id) === -1) {
    throw new RequestError(`Queue ${task.queue_id} does not exist`);
  }

  if (task.events) {
    task.events = validateEvents(task.events);
  }

  const parentTask = await getTask(context.connection, {
    context: context.state.jwt.context,
    user: context.state.jwt.user,
    id: parentId,
    scope: context.state.jwt.scope,
  });

  // Override the parent task.
  task.parent_task = parentId;

  const id = v4();
  await insertTask(context.connection, {
    id,
    task,
    user: context.state.jwt.user,
    context: context.state.jwt.context,
  });

  context.response.status = 201;

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

  // Parent task events.
  context.state.dispatch(parentTask, 'modified');
  context.state.dispatch(parentTask, 'subtask_created', undefined, { subtaskId: id });
  context.state.dispatch(parentTask, 'subtask_type_created', task.type);
  context.state.dispatch(parentTask, 'subtask_status', task.status, { status_text: task.status_text });
};
