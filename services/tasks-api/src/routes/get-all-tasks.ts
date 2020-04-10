import { RouteMiddleware } from '../types';
import { NotFoundError, sql } from 'slonik';

export const getAllTasks: RouteMiddleware = async context => {
  try {
    if (context.state.jwt.scope.indexOf('tasks.admin') === -1) {
      const userId = context.state.jwt.user.id;
      // Not an admin.
      context.response.body = await context.connection.many(
        sql`
        SELECT t.id, t.name, t.status, t.status_text, t.type
        FROM tasks t 
        WHERE t.parent_task IS NULL 
          AND (t.creator_id = ${userId} OR t.assignee_id = ${userId})
          AND context ?& ${sql.array(context.state.jwt.context, 'text')}`
      );
      return;
    }

    context.response.body = await context.connection.many(
      sql`
        SELECT t.id, t.name, t.status, t.status_text, t.type
        FROM tasks t 
        WHERE t.parent_task IS NULL
          AND context ?& ${sql.array(context.state.jwt.context, 'text')}`
    );
  } catch (e) {
    if (e instanceof NotFoundError) {
      context.response.body = [];
    } else {
      throw e;
    }
  }
};
