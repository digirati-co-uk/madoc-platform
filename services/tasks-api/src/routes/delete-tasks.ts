import { RouteMiddleware } from '../types';
import { Forbidden } from '../errors/forbidden';
import { RequestError } from '../errors/request-error';
import { sql } from 'slonik';

export const batchDeleteTasks: RouteMiddleware = async (context, next) => {
  const isAdmin = context.state.jwt.scope.indexOf('tasks.admin') !== -1;
  const resourceId = context.query.resourceId;
  const subject = context.query.subject;

  if (!isAdmin) {
    throw new Forbidden();
  }

  if (!resourceId && !subject) {
    throw new RequestError();
  }

  if (!!resourceId) {
    await context.connection.query(sql`
      delete from tasks
      where state ->> 'resourceId' = ${String(resourceId)};
    `);
  }

  if (!!subject) {
    await context.connection.query(sql`
      delete from tasks
      where subject = ${subject}
      or subject_parent = ${subject};
    `);
  }

  context.response.status = 200;
};
