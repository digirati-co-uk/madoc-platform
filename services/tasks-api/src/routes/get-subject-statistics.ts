import { RouteMiddleware } from '../types';
import { sql } from 'slonik';

export const getSubjectStatistics: RouteMiddleware<{ id: string }> = async ctx => {
  // Given a list of subjects
  const subjects = ctx.query.subjects;
  // And a task id (root or parent)
  const taskId = ctx.params.id;
  const context = ctx.state.jwt.context;
  const type = ctx.query.type;

  const subjectQuery = subjects ? sql`and t.subject = any (${sql.array(subjects.split(','), 'text')})` : sql``;
  const typeQuery = type ? sql`and t.type = ${type}` : sql``;

  const results = await ctx.connection.any(sql`
    select subject, status from tasks t 
        where  t.root_task = ${taskId} 
        ${subjectQuery}
        ${typeQuery}
        and t.context ?& ${sql.array(context, 'text')}
  `);

  ctx.response.body = {
    input: subjects,
    subjects: results,
  };
};
