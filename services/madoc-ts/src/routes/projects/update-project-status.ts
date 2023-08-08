// Updates metadata on underlying collection inside the project.
import { RouteMiddleware } from '../../types/route-middleware';
import { sql } from 'slonik';
import { NotFound } from '../../utility/errors/not-found';
import { RequestError } from '../../utility/errors/request-error';
import { parseProjectId } from '../../utility/parse-project-id';
import { SQL_EMPTY } from '../../utility/postgres-tags';
import { userWithScope } from '../../utility/user-with-scope';

type UpdateProjectStatus = {
  status: number;
};

export const updateProjectStatus: RouteMiddleware<{ id: string }, UpdateProjectStatus> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const { projectSlug, projectId } = parseProjectId(context.params.id);
  const { status } = context.requestBody;

  if (!projectSlug && !projectId) {
    throw new NotFound();
  }

  if (status > 4 || status < 0) {
    throw new RequestError('Status must be between 0-4');
  }

  await context.connection.query(sql`
    update iiif_project set status = ${status} 
    where 
      ${projectId ? sql`id = ${projectId}` : SQL_EMPTY}
      ${projectSlug ? sql`slug = ${projectSlug}` : SQL_EMPTY}
      and site_id = ${siteId}
  `);

  if (status === 1) {
    // Project has started. We should set the "Start date" if not already set.
    await context.connection.query(sql`
      update iiif_project set start_date = now()
      where
        ${projectId ? sql`id = ${projectId}` : SQL_EMPTY}
        ${projectSlug ? sql`slug = ${projectSlug}` : SQL_EMPTY}
        and site_id = ${siteId}
        and start_date is null
    `);
  }

  context.response.status = 204;
};
