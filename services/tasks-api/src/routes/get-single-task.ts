import { RouteMiddleware } from '../types';
import { mapSingleTask } from '../utility/map-single-task';
import { sql } from 'slonik';

export const getSingleTask: RouteMiddleware<{ id: string }> = async context => {
  if (context.state.jwt.scope.indexOf('tasks.admin') === -1) {
    const userId = context.state.jwt.user.id;
    // Not an admin.
    const singleTask = await context.connection.one(
      sql`
        SELECT * 
        FROM tasks t 
        WHERE id = ${context.params.id}
        AND (t.creator_id = ${userId} OR t.assignee_id = ${userId})`
    );

    context.response.body = mapSingleTask(singleTask);

    return;
  }

  const singleTask = await context.connection.one(
    sql`
        SELECT * 
        FROM tasks t 
        WHERE id = ${context.params.id}`
  );

  context.response.body = mapSingleTask(singleTask);
};
