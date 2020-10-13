import { sql } from 'slonik';
import { NotFound } from '../errors/not-found';
import { RouteMiddleware } from '../types';

export const exportTasks: RouteMiddleware = async context => {
  const isAdmin = context.state.jwt.scope.indexOf('tasks.admin') !== -1;

  if (!isAdmin) {
    throw new NotFound();
  }

  const tasks = await context.connection.any(sql`
    select * from tasks where context ?& ${sql.array(context.state.jwt.context, 'text')}
  `);

  context.response.body = { tasks };
};
