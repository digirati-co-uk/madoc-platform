import { sql } from 'slonik';
import { addSlot, mapSlot } from '../../database/queries/site-editorial';
import { RouteMiddleware } from '../../types/route-middleware';
import { CreateSlotRequest } from '../../types/schemas/site-page';
import { userWithScope } from '../../utility/user-with-scope';

export const createSlot: RouteMiddleware<{}, CreateSlotRequest> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const slotReq = context.requestBody;

  const slot = await context.connection.one(addSlot(slotReq, siteId));

  if (slotReq.pageId) {
    const page = await context.connection.one(
      sql`select id from site_pages where site_id = ${siteId} and id = ${slotReq.pageId}`
    );

    await context.connection.query(sql`
      insert into site_page_slots (slot_id, page_id) VALUES (${slot.id}, ${page.id})
    `);
  }

  context.response.body = mapSlot(slot);
};
