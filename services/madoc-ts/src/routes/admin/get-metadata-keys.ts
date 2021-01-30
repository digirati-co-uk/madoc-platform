import { sql } from 'slonik';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const getMetadataKeys: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const response = await context.connection.any(sql`
      select value as label, count(resource_id) as total_items, language
      from iiif_metadata
      where site_id = ${siteId}
        and key ilike 'metadata.%.label'
      group by (value, language) order by (total_items) desc;
  `);

  // Metadata keys.
  context.response.body = {
    metadata: response,
  };
};
