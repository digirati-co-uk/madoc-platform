import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import { sql } from 'slonik';

export const deleteTask: RouteMiddleware<{ id: string }> = async (context) => {
  if (context.state.jwt.scope.indexOf('tasks.admin') === -1) {
    throw new NotFound();
  }

  const task = await context.connection.one<{ id: string; type: string; events: string[] }>(sql`
    SELECT id, type, events FROM tasks WHERE id = ${context.params.id}
  `);

  // We need to delete more manually now.
  const { rowCount: rc1 } = await context.connection.query(sql`
      DELETE FROM tasks
      WHERE root_task = ${context.params.id}
  `);

  const { rowCount: rc2 } = await context.connection.query(sql`
      DELETE FROM tasks
      WHERE delegated_task = ${context.params.id}
  `);

  const { rowCount: rc3 } = await context.connection.query(sql`
      DELETE FROM tasks
      WHERE parent_task = ${context.params.id}
  `);

  const { rowCount: rc4 } = await context.connection.query(sql`
    DELETE FROM tasks 
    WHERE id = ${context.params.id}
  `);

  const rowCount = rc1 + rc2 + rc3 + rc4;

  if (rowCount === 0) {
    // Don't 404, just assume it's already deleted.
    context.response.status = 200;
    return;
  }

  context.state.dispatch(task, 'deleted');

  context.response.status = 204;
};
