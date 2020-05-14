import { RouteMiddleware } from '../../../types/route-middleware';
import { sql } from 'slonik';

export const getManifestAutocomplete: RouteMiddleware = async context => {
  const { q } = context.query;

  if (!q) {
    context.response.body = [];
    return;
  }

  const query = sql`
    select distinct im.resource_id as id, im.value as label
    from iiif_derived_resource
             left join iiif_metadata im
                       on iiif_derived_resource.resource_id = im.resource_id and im.site_id = 1 and im.key = 'label'
                           and im.value ilike '%' || ${q} || '%'
    where iiif_derived_resource.resource_type = 'manifest'
      and im.resource_id is not null
      and iiif_derived_resource.site_id = 1 limit 10;
  `;

  context.response.body = await context.connection.any<{ id: number; label: string }>(query);
};
