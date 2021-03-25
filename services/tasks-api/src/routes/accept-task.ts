import { RouteMiddleware } from '../types';
import { sql } from 'slonik';
import { getTask } from '../database/get-task';
import { mapSingleTask } from '../utility/map-single-task';

export const acceptTask: RouteMiddleware<{ id: string }, { omitSubtasks: boolean }> = async context => {
  const id = context.params.id;
  const scope = context.state.jwt.scope;
  const userId = context.state.jwt.user.id;
  const userCtx = context.state.jwt.context;
  const { omitSubtasks } = context.requestBody || {};

  const scopedQuery =
    scope.indexOf('tasks.admin') !== -1 || scope.indexOf('tasks.create') !== -1
      ? sql`AND (creator_id = ${userId} OR assignee_id = ${userId}) AND context ?& ${sql.array(userCtx, 'text')}`
      : sql`AND context ?& ${sql.array(userCtx, 'text')}`;

  const task = await context.connection.one(sql`
    UPDATE tasks SET status = 1, status_text = 'accepted' WHERE id = ${id} ${scopedQuery} returning *
  `);

  if (omitSubtasks) {
    context.response.body = mapSingleTask(task);
    return;
  }

  context.response.body = await getTask(context.connection, {
    context: context.state.jwt.context,
    user: context.state.jwt.user,
    id: context.params.id,
    scope: context.state.jwt.scope,
    all: true,
  });
};
