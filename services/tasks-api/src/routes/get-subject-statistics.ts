import { RouteMiddleware } from '../types';
import { sql } from 'slonik';

export const getSubjectStatistics: RouteMiddleware<{ id: string }> = async ctx => {
  // Given a list of subjects
  const subjects = ctx.query.subjects.split(',');
  // And a task id (root or parent)
  const taskId = ctx.params.id;
  const context = ctx.state.jwt.context;
  const type = ctx.query.type;

  if (subjects.length === 0 || !ctx.query.subjects) {
    ctx.response.body = {
      results: [],
    };
  }

  const results = await ctx.connection.any(sql`
    select subject, status from tasks t 
        where t.subject = any (${sql.array(subjects, 'text')})
        and t.root_task = ${taskId}
        ${type ? sql`and t.type = ${type}` : sql``}
        and t.context ?& ${sql.array(context, 'text')}
  `);

  ctx.response.body = {
    input: subjects,
    subjects: results,
  };
};
