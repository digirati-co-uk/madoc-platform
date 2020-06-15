import { RouteMiddleware } from '../types';
import { NotFoundError, sql } from 'slonik';

export const getAllTasks: RouteMiddleware = async context => {
  // Subject facet.
  // Type filter.
  // Include sub-tasks filter.
  const isAdmin = context.state.jwt.scope.indexOf('tasks.admin') !== -1;
  const userId = context.state.jwt.user.id;
  const typeFilter = context.query.type ? sql`and t.type = ${context.query.type}` : sql``;
  const subjectFilter = context.query.subject ? sql`and t.subject = ${context.query.subject}` : sql``;
  const statusFilter = context.query.status ? sql`and t.status = ${Number(context.query.status)}` : sql``;
  const subtaskExclusion = context.query.all_tasks ? sql`` : sql`and t.parent_task is null`;
  const userExclusion = isAdmin ? sql`` : sql`and (t.creator_id = ${userId} OR t.assignee_id = ${userId})`;

  const page = Number(context.query.page || 1);
  const perPage = 50;
  const offset = (page - 1) * perPage;
  const taskPagination = sql`limit ${perPage} offset ${offset}`;

  try {
    const query = sql`
      SELECT t.id, t.name, t.status, t.status_text, t.type
      FROM tasks t 
      WHERE context ?& ${sql.array(context.state.jwt.context, 'text')}
        ${subtaskExclusion}
        ${userExclusion}
        ${typeFilter}
        ${subjectFilter}
        ${statusFilter}
    `;

    const { rowCount } = await context.connection.query(query);

    const taskList = await context.connection.many(
      sql`
        ${query}
        ${taskPagination}
      `
    );

    context.response.body = {
      tasks: taskList,
      pagination: {
        page,
        total_results: rowCount,
        total_pages: Math.ceil(rowCount / perPage),
      },
    };
  } catch (e) {
    if (e instanceof NotFoundError) {
      context.response.body = { tasks: [], pagination: { page: 1, total_pages: 1, total_results: 0 } };
    } else {
      throw e;
    }
  }
};
