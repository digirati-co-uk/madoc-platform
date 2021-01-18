import { sql } from 'slonik';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const deletePage: RouteMiddleware<{ paths: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const pathToFind = `/${context.params.paths}`;

  await context.connection.query(sql`
    delete from site_pages where path = ${pathToFind} and site_id = ${siteId}
  `);

  context.response.status = 200;
};
