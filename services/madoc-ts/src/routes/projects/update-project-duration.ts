import { getProject } from '../../database/queries/project-queries';
import { RouteMiddleware } from '../../types/route-middleware';
import { sql } from 'slonik';
import { NotFound } from '../../utility/errors/not-found';
import { RequestError } from '../../utility/errors/request-error';
import { parseProjectId } from '../../utility/parse-project-id';
import { SQL_EMPTY } from '../../utility/postgres-tags';
import { userWithScope } from '../../utility/user-with-scope';

type UpdateProjectDuration = {
  dueDate: string;
};

export const updateProjectDuration: RouteMiddleware<{ id: string }, UpdateProjectDuration> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const { projectSlug, projectId } = parseProjectId(context.params.id);
  const { dueDate } = context.requestBody;

  if (!projectSlug && !projectId) {
    throw new NotFound();
  }

  const date = new Date(dueDate);
  // Format as YYYY-MM-DD
  date.setHours(0, 0, 0, 0);
  const formatted = date.toISOString().split('T')[0];

  // Check if date is in the future
  if (date.getTime() < Date.now()) {
    throw new RequestError('Due date must be in the future');
  }

  await context.connection.query(sql`
    update iiif_project set due_date = ${formatted} 
    where 
      ${projectId ? sql`id = ${projectId}` : SQL_EMPTY}
      ${projectSlug ? sql`slug = ${projectSlug}` : SQL_EMPTY}
      and site_id = ${siteId}
  `);

  context.response.status = 200;
};
