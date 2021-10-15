import { sql } from 'slonik';
import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const deleteApiKey: RouteMiddleware = async context => {
  const { siteId } = await onlyGlobalAdmin(context);

  await context.connection.query(sql`
    delete from api_key 
        where client_id = ${context.params.client_id}
        and site_id = ${siteId}
  `);

  context.response.status = 200;
};
