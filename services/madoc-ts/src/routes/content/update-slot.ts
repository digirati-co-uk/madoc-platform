import { sql } from 'slonik';
import { editSlot, mapSlot } from '../../database/queries/site-editorial';
import { RouteMiddleware } from '../../types/route-middleware';
import { CreateSlotRequest } from '../../types/schemas/site-page';
import { userWithScope } from '../../utility/user-with-scope';

export const updateSlot: RouteMiddleware<{ slotId: string }, CreateSlotRequest> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const slotId = Number(context.params.slotId);
  const slotUpdates = context.requestBody;

  // Will throw if you point to a slugged post.
  const slot = await context.connection.one(sql<{ id: number }>`
    select id from site_slots where id = ${slotId} and site_id = ${siteId}
  `);

  const newSlot = await context.connection.one(editSlot(slot.id, slotUpdates, siteId));

  context.response.body = {
    slot: mapSlot(newSlot),
  };
};
