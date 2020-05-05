import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import { CreateTask } from '../schemas/CreateTask';
import { RequestError } from '../errors/request-error';
import { v4 } from 'uuid';
import { insertTask } from '../database/insert-task';
import { getTask } from '../database/get-task';
import { validateEvents } from '../utility/events';
import { mapSingleTask } from '../utility/map-single-task';

export const createSubtask: RouteMiddleware<{ id: string }, CreateTask | CreateTask[]> = async context => {
  const parentId = context.params.id;
  const isAdmin = context.state.jwt.scope.indexOf('tasks.admin') !== -1;
  const canCreate = isAdmin || context.state.jwt.scope.indexOf('tasks.create') !== -1;

  if (!canCreate) {
    throw new NotFound();
  }

  const parentTask = await getTask(context.connection, {
    user: context.state.jwt.user,
    id: parentId,
    scope: context.state.jwt.scope,
    context: context.state.jwt.context,
  });

  const contextForSubtask = parentTask.context;
  const returnTasks: any[] = [];
  const isMany = Array.isArray(context.requestBody);
  const tasks: CreateTask[] = isMany ? (context.requestBody as CreateTask[]) : [context.requestBody as CreateTask];
  for (const task of tasks) {
    if (task.parent_task && task.parent_task !== parentId) {
      // Skip any mis-matched items.
      continue;
    }

    if (task.events) {
      task.events = validateEvents(task.events, context.state.queueList);
    }

    // Override the parent task.
    task.parent_task = parentId;

    const id = v4();
    const createdTask = await insertTask(context.connection, {
      id,
      task,
      user: context.state.jwt.user,
      context: contextForSubtask,
    });

    returnTasks.push(mapSingleTask(createdTask));

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
  }

  if (returnTasks.length === 0) {
    throw new RequestError();
  }

  if (isMany) {
    context.response.status = 201;
    context.response.body = returnTasks;
  } else {
    context.response.status = 201;
    context.response.body = returnTasks[0];
  }
};
