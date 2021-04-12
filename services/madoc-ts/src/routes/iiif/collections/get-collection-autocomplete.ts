import { RouteMiddleware } from '../../../types/route-middleware';
import { sql } from 'slonik';
import { optionalUserWithScope } from '../../../utility/user-with-scope';

export const getCollectionAutocomplete: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.admin']);
  const { q } = context.query;

  if (!q) {
    context.response.body = [];
    return;
  }

  const query = sql`
    select distinct im.resource_id as id, im.value as label
    from iiif_derived_resource
             left join iiif_metadata im
                       on iiif_derived_resource.resource_id = im.resource_id and im.site_id = ${siteId} and im.key = 'label'
                           and im.value ilike '%' || ${q} || '%'
    where iiif_derived_resource.resource_type = 'collection'
      and im.resource_id is not null
      and flat = false
      and iiif_derived_resource.site_id = ${siteId} limit 10;
  `;

  context.response.body = await context.connection.any<{ id: number; label: string }>(query);
};
