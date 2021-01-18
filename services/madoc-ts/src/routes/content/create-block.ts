import { sql } from 'slonik';
import { addBlock, mapBlock } from '../../database/queries/site-editorial';
import { RouteMiddleware } from '../../types/route-middleware';
import { SiteBlockRequest } from '../../types/schemas/site-page';
import { userWithScope } from '../../utility/user-with-scope';

export const createBlock: RouteMiddleware<{ slotId?: string }, SiteBlockRequest> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const blockReq = context.requestBody;
  const slotId = context.params.slotId;

  const block = await context.connection.one(addBlock(blockReq, siteId));

  if (slotId) {
    const slot = await context.connection.one(
      sql`select id from site_block where site_id = ${siteId} and id = ${slotId}`
    );

    await context.connection.query(sql`
      insert into site_slot_blocks (slot_id, block_id) VALUES (${slot.id}, ${block.id})
    `);
  }

  context.response.body = mapBlock(block);
  context.response.status = 201;
};
