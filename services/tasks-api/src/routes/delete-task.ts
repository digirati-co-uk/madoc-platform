import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import { sql } from 'slonik';

export const deleteTask: RouteMiddleware<{ id: string }> = async context => {
  if (context.state.jwt.scope.indexOf('tasks.admin') === -1) {
    throw new NotFound();
  }

  const { rowCount } = await context.connection.query(sql`
    DELETE FROM tasks 
    WHERE id = ${context.params.id}
  `);

  if (rowCount === 0) {
    context.response.status = 404;
    return;
  }

  context.response.status = 204;
};
