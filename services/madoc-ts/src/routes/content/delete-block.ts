import { sql } from 'slonik';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const deleteBlock: RouteMiddleware<{ blockId: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const blockId = Number(context.params.blockId);

  await context.connection.query(sql`
    delete from site_block where id = ${blockId} and site_id = ${siteId}
  `);

  context.response.status = 200;
};
