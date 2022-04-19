import { sql } from 'slonik';
import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const listApiKeys: RouteMiddleware = async context => {
  const { siteId } = await onlyGlobalAdmin(context);

  const keys = await context.connection.any(sql<{
    label: string;
    user_id: number;
    user_name: string;
    client_id: string;
    scope: string[];
    last_used: string | null;
    created_at: string;
  }>`
    select 
       label, 
       u.name as user_name, 
       user_id,
       client_id,
       scope,
       last_used,
       created_at
    from api_key
        left join "user" u on u.id = api_key.user_id
        where site_id = ${siteId}
  `);

  context.response.body = { keys };
};
