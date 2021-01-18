import { sql } from 'slonik';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const deleteSlot: RouteMiddleware<{ slotId: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const slotId = Number(context.params.slotId);

  await context.connection.query(sql`
    delete from site_slots where id = ${slotId} and site_id = ${siteId}
  `);

  context.response.status = 200;
};
