import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';
import { addLinks, mapLink } from '../../../database/queries/linking-queries';
import { RequestError } from '../../../utility/errors/request-error';
import { extractLink } from '../../../utility/extract-links';
import { sql } from 'slonik';

export const addLinking: RouteMiddleware<
  {},
  { link: any; property: string; source?: string; label?: string; resource_id: string }
> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const { link, property, source, label, resource_id } = context.request.body;

  if (!link || !link.id || !property) {
    throw new Error('Invalid link');
  }

  const extracted = extractLink(link, property, { source, defaultLabel: label });
  if (!extracted.length || extracted.length > 1) {
    throw new RequestError('Invalid link');
  }
  const linkQuery = addLinks(extracted, resource_id, siteId);

  if (!linkQuery) {
    throw new RequestError('Invalid link');
  }

  await context.connection.query(linkQuery);

  context.response.body = mapLink(
    await context.connection.one(sql`select * from iiif_linking where site_id=${siteId} and uri=${link.id}`)
  );

  context.response.status = 201;
};
