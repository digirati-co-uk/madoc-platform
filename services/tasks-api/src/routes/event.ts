import { RouteMiddleware } from '../types';
import { sql } from 'slonik';
import { NotFound } from '../errors/not-found';

export const postEvent: RouteMiddleware<
  { id: string; event: string },
  { subject?: string; state?: any }
> = async context => {
  const id = context.params.id;
  const event = context.params.event;
  const isAdmin = context.state.jwt.scope.indexOf('tasks.admin') !== -1;
  const { state, subject } = context.requestBody || {};

  if (!isAdmin) {
    throw new NotFound();
  }

  const { events, type } = await context.connection.one(sql<{
    assignee_id: string;
    creator_id: string;
    events?: string[];
    type: string;
  }>`
      SELECT t.assignee_id, t.creator_id, t.events, t.type 
      FROM tasks t 
      WHERE id = ${id} 
        AND context ?& ${sql.array(context.state.jwt.context, 'text')}
    `);

  const taskWithId = { id, type, events };

  context.state.dispatch(taskWithId, event as any, subject, state);

  context.response.status = 200;
};
