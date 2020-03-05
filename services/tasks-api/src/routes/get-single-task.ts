import { RouteMiddleware } from '../types';
import { mapSingleTask } from '../utility/map-single-task';
import { sql } from 'slonik';

export const getSingleTask: RouteMiddleware<{ id: string }> = async context => {
  if (context.state.jwt.scope.indexOf('tasks.admin') === -1) {
    const userId = context.state.jwt.user.id;
    // Not an admin.
    const taskList = await context.connection.many(
      sql`
        SELECT *
        FROM tasks t 
        WHERE (t.id = ${context.params.id} OR t.parent_task = ${context.params.id})
        AND (t.creator_id = ${userId} OR t.assignee_id = ${userId})
        AND context ?& ${sql.array(context.state.jwt.context, 'text')}`
    );

    const actualTask = taskList.find(t => t.id === context.params.id);
    const subtasks = taskList.filter(t => t.id !== context.params.id);

    context.response.body = mapSingleTask(actualTask, subtasks);

    return;
  }

  const taskList = await context.connection.many(
    sql`
        SELECT * 
        FROM tasks t
        WHERE (t.id = ${context.params.id} OR t.parent_task = ${context.params.id})
        AND t.context ?& ${sql.array(context.state.jwt.context, 'text')}`
  );

  const actualTask = taskList.find(t => t.id === context.params.id);
  const subtasks = taskList.filter(t => t.id !== context.params.id);

  context.response.body = mapSingleTask(actualTask, subtasks);
};
