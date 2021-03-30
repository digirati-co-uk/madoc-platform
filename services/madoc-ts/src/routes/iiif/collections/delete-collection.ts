import { sql } from 'slonik';
import { userWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import { deleteResource } from '../../../database/queries/resource-queries';

export const deleteCollection: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  await context.connection.any(deleteResource(context.params.id, 'collection', siteId));

  await context.connection.query(sql`select refresh_item_counts()`);

  context.response.status = 200;
};
