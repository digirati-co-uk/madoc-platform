import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import { sql } from 'slonik';
import { mapSingleTask } from '../utility/map-single-task';

export const updateMetadata: RouteMiddleware<{ id: string }> = async context => {
  const id = context.params.id;
  const isAdmin = context.state.jwt.scope.indexOf('tasks.admin') !== -1;

  if (!isAdmin) {
    throw new NotFound(); // Maybe access denied?
  }

  const metadata = context.requestBody as any;

  const currentTask = await context.connection.one<{
    id: string;
    metadata: any | null;
  }>(sql`
      SELECT t.id, t.metadata
      FROM tasks t 
      WHERE t.id = ${id} 
        AND t.context ?& ${sql.array(context.state.jwt.context, 'text')}
    `);

  if (!currentTask) {
    throw new NotFound();
  }

  const newMetadata = {
    ...(currentTask.metadata || {}),
    ...(metadata || {}),
  };

  const task = await context.connection.one(sql`
    UPDATE tasks SET metadata = ${sql.json(newMetadata)} WHERE id = ${id} RETURNING *
  `);

  context.response.body = mapSingleTask(task);
};
