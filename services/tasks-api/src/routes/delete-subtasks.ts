import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import { sql } from 'slonik';
import { castStringBool } from '../utility/cast-string-bool';

export const deleteSubtasks: RouteMiddleware<{ id: string }> = async context => {
  if (context.state.jwt.scope.indexOf('tasks.admin') === -1) {
    throw new NotFound();
  }

  const dispatch = castStringBool(context.query.dispatch);

  if (dispatch) {
    const tasks = await context.connection.many<{ id: string; type: string; events: string[] }>(sql`
        SELECT id, type, events
        FROM tasks
        WHERE root_task = ${context.params.id}
    `);

    const { rowCount } = await context.connection.query(sql`
        DELETE
        FROM tasks
        WHERE root_task = ${context.params.id}
    `);

    if (rowCount === 0) {
      context.response.status = 200;
      return;
    }

    for (const task of tasks) {
      context.state.dispatch(task, 'deleted');
    }

    context.response.status = 204;
  } else {
    await context.connection.query(sql`
        DELETE
        FROM tasks
        WHERE root_task = ${context.params.id}
    `);

    context.response.status = 204;
  }
};
