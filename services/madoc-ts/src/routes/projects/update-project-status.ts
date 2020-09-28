// Updates metadata on underlying collection inside the project.
import { RouteMiddleware } from '../../types/route-middleware';
import { sql } from 'slonik';
import { RequestError } from '../../utility/errors/request-error';
import { userWithScope } from '../../utility/user-with-scope';

type UpdateProjectStatus = {
  status: number;
};

export const updateProjectStatus: RouteMiddleware<{ id: string }, UpdateProjectStatus> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const id = Number(context.params.id);
  const { status } = context.requestBody;

  if (status > 4 || status < 0) {
    throw new RequestError('Status must be between 0-4');
  }

  await context.connection.query(sql`
    update iiif_project set status = ${status} where id = ${id} and site_id = ${siteId}
  `);

  context.response.status = 200;
};
