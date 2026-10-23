import { sql } from 'slonik';
import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';
import { ResourceLinkRow, updateLinks } from '../../../database/queries/linking-queries';
import { RequestError } from '../../../utility/errors/request-error';

export const updateLinking: RouteMiddleware<
  { id: string },
  { link: ResourceLinkRow; resource_id: string }
> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const { link, resource_id } = context.requestBody;
  if (Number(link.id) !== Number(context.params.id)) throw new RequestError('Link identifier does not match the route');

  const annotation = await context.connection.maybeOne(
    sql`select id from iiif_linking where id = ${Number(context.params.id)} and site_id = ${siteId} and property = 'annotations'`
  );
  if (annotation || link.property === 'annotations') throw new RequestError('Use the annotation page API');

  const linkQuery = updateLinks([link], Number(resource_id), siteId);

  if (!linkQuery) {
    throw new RequestError('Invalid link');
  }

  await context.connection.query(linkQuery);

  context.response.status = 201;
};
