import { RouteMiddleware } from '../types';
import { sql } from 'slonik';
import { getTask } from '../database/get-task';

export const acceptTask: RouteMiddleware<{ id: string }> = async context => {
  const id = context.params.id;
  const scope = context.state.jwt.scope;
  const userId = context.state.jwt.user.id;
  const userCtx = context.state.jwt.context;

  const scopedQuery =
    scope.indexOf('tasks.admin') === -1
      ? sql`AND (creator_id = ${userId} OR assignee_id = ${userId}) AND context ?& ${sql.array(userCtx, 'text')}`
      : sql`AND context ?& ${sql.array(userCtx, 'text')}`;

  await context.connection.query(sql`
    UPDATE tasks SET status = 1, status_text = 'accepted' WHERE id = ${id} ${scopedQuery}
  `);

  context.response.body = await getTask(context.connection, {
    context: context.state.jwt.context,
    user: context.state.jwt.user,
    id: context.params.id,
    scope: context.state.jwt.scope,
    all: true,
  });
};
