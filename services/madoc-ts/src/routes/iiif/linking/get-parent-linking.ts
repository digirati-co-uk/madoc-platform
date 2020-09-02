import { RouteMiddleware } from '../../../types/route-middleware';
import { getLinks, mapLink } from '../../../database/queries/linking-queries';
import { optionalUserWithScope } from '../../../utility/user-with-scope';

export const getParentLinking: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.view']);
  const parentResourceId = Number(context.params.id);

  const { source, format, type, property, resource_id, ...propertyQuery } = context.query;

  const links = await context.connection.any(
    getLinks({
      site_id: siteId,
      resource_id: resource_id,
      parent_resource_id: parentResourceId,
      source: source,
      format: format,
      property: property,
      type: type,
      propertyMatch: propertyQuery,
    })
  );

  // Returns some linking.
  context.response.body = {
    linking: links.map(mapLink),
  };
};
