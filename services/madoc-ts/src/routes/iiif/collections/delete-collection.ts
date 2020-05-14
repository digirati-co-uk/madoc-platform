import { userWithScope } from '../../../utility/user-with-scope';
import { sql } from 'slonik';
import { RouteMiddleware } from '../../../types/route-middleware';

export const deleteCollection: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  await context.connection.any(
    sql`delete from iiif_derived_resource where resource_id = ${context.params.id} and resource_type = 'collection' and site_id = ${siteId}`
  );

  context.response.status = 200;
};
