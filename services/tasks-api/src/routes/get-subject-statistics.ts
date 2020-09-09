import { RouteMiddleware } from '../types';
import { sql } from 'slonik';

export const getSubjectStatistics: RouteMiddleware<{ id: string }> = async ctx => {
  const body = ctx.request.body;
  // Given a list of subjects
  const subjects = body && body.subjects ? body.subjects : ctx.query.subjects;
  const parentTask = body && body.parentTask ? body.parentTask : ctx.query.parent_task;
  const subjectsArray = Array.isArray(subjects) ? subjects : subjects.split(',');
  // And a task id (root or parent)
  const taskId = ctx.params.id;
  const context = ctx.state.jwt.context;
  const type = ctx.query.type;
  const parentSubject = ctx.query.parent_subject;
  const assignee = ctx.query.assignee && ctx.query.assignee === 'true';
  const assigned_to = ctx.query.assigned_to;

  const subjectQuery = subjectsArray ? sql`and t.subject = any (${sql.array(subjectsArray, 'text')})` : sql``;
  const typeQuery = type ? sql`and t.type = ${type}` : sql``;
  const parentJoin = parentSubject ? sql`left outer join tasks pt on t.parent_task = pt.id` : sql``;
  const parentQuery = parentSubject ? sql`and pt.subject = ${parentSubject}` : sql``;
  const assigneeFields = assignee ? sql`, t.assignee_id` : sql``;
  const assignedToQuery = assigned_to ? sql`and t.assignee_id = ${assigned_to}` : sql``;

  const results = await ctx.connection.any(sql`
    select t.subject, t.status ${assigneeFields} from tasks t 
        ${parentJoin}
        where  ${parentTask ? sql`t.parent_task = ${taskId}` : sql`t.root_task = ${taskId}`} 
        ${subjectQuery}
        ${typeQuery}
        ${parentQuery}
        ${assignedToQuery}
        and t.context ?& ${sql.array(context, 'text')}
  `);

  ctx.response.body = {
    subjects: results,
  };
};
