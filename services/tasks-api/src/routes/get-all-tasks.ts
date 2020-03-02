import { RouteMiddleware } from '../types';

export const getAllTasks: RouteMiddleware = async context => {
  context.response.body = await context.connection.many(
    context.sql.TaskSnippet`SELECT t.id, t.name, t.status from tasks t WHERE parent_task IS NULL`
  );
};
