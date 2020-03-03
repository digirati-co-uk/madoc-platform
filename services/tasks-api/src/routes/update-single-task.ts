import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import { sql } from 'slonik';

export const updateSingleTask: RouteMiddleware<{ id: string }> = async context => {
  const id = context.params.id;
  const userId = context.state.jwt.user.id;
  const isAdmin = context.state.jwt.scope.indexOf('tasks.admin') !== -1;
  const canOnlyProgress = !isAdmin && context.state.jwt.scope.indexOf('tasks.progress') !== -1;

  // @ts-ignore
  const { assignee_id, creator_id } = context.connection.one(
    sql`SELECT t.assignee_id, t.creator_id FROM tasks t WHERE id = ${id}`
  );

  if (canOnlyProgress && (creator_id !== userId || assignee_id !== userId)) {
    // Only apply status change.
    return;
  }

  if (!isAdmin && (creator_id !== userId || assignee_id !== userId)) {
    throw new NotFound(); // Maybe access denied?
  }

  // Otherwise update the task.

  throw new NotFound('Not yet implemented');
};
