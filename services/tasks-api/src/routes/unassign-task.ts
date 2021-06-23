import { NotFound } from '../errors/not-found';
import { RouteMiddleware } from '../types';
import { sql } from 'slonik';
import { mapSingleTask } from '../utility/map-single-task';

export const unassignTask: RouteMiddleware<{ id: string }, { omitSubtasks: boolean }> = async context => {
  const id = context.params.id;
  const scope = context.state.jwt.scope;
  const userCtx = context.state.jwt.context;

  const isAdmin = scope.indexOf('tasks.admin') !== -1;
  const canCreate = isAdmin || scope.indexOf('tasks.create') !== -1;

  if (!canCreate) {
    throw new NotFound();
  }

  const scopedQuery = sql`AND context ?& ${sql.array(userCtx, 'text')}`;

  const task = await context.connection.one(sql<any>`
    UPDATE tasks SET assignee_id = null, assignee_is_service = null, assignee_name = null WHERE id = ${id} ${scopedQuery} returning *
  `);

  context.state.dispatch({ id: task.id, type: task.type, events: task.events }, 'assigned');

  context.response.body = mapSingleTask(task);
  return;
};
