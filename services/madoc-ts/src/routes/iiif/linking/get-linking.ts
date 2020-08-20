import { RouteMiddleware } from '../../../types/route-middleware';
import { getLinks } from '../../../database/queries/linking-queries';
import { optionalUserWithScope } from '../../../utility/user-with-scope';

export const getLinking: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.view']);
  const resourceId = Number(context.params.id);

  const { source, format, type, property, ...propertyQuery } = context.query;

  const links = await context.connection.any(
    getLinks({
      site_id: siteId,
      resource_id: resourceId,
      source: source,
      format: format,
      property: property,
      type: type,
      propertyMatch: propertyQuery,
    })
  );

  // Returns some linking.
  context.response.body = {
    linking: links,
  };
};
