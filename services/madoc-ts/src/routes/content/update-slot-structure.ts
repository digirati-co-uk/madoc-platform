import { sql } from 'slonik';
import { RouteMiddleware } from '../../types/route-middleware';
import { SQL_COMMA } from '../../utility/postgres-tags';
import { inserts } from '../../utility/slonik-helpers';
import { userWithScope } from '../../utility/user-with-scope';

export const updateSlotStructure: RouteMiddleware<{ slotId: string }, { blocks: number[] }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const slotId = Number(context.params.slotId);
  const { blocks } = context.requestBody;
  const currentStructure = await context.connection.many(sql<{
    slot_id: number;
    block_id: number;
    display_order: number;
  }>`
    select blocks.* from site_slots left join site_slot_blocks blocks on site_slots.id = blocks.slot_id where site_slots.id = ${slotId} and site_slots.site_id = ${siteId}
  `);

  const currentIds = currentStructure.map(s => s.block_id);
  const blockIndex: { [id: number]: { slot_id: number; block_id: number; display_order: number } } = {};
  for (const structure of currentStructure) {
    blockIndex[structure.block_id] = structure;
  }

  // To remove
  const toRemove: number[] = [];
  for (const block of currentIds) {
    if (blocks.indexOf(block) === -1) {
      toRemove.push(block);
    }
  }

  // Calculate new order.
  const newBlocks: Array<{ slot_id: number; block_id: number; display_order: number }> = [];
  const changeBlocks: Array<{ slot_id: number; block_id: number; display_order: number }> = [];
  for (let i = 0; i < blocks.length; i++) {
    const blockId = blocks[i];
    const existing = blockIndex[blockId];

    // if it exists.
    if (existing) {
      if (existing.display_order !== i) {
        changeBlocks.push({
          slot_id: slotId,
          block_id: blockId,
          display_order: i,
        });
      }
    } else {
      newBlocks.push({
        slot_id: slotId,
        block_id: blockId,
        display_order: i,
      });
    }
  }

  if (newBlocks.length) {
    await context.connection.query(sql`
      insert into site_slot_blocks (slot_id, block_id, display_order) 
        values ${inserts(
          newBlocks.map(block => sql.join([block.slot_id, block.block_id, block.display_order], SQL_COMMA))
        )}
    `);
  }

  if (changeBlocks.length) {
    await context.connection.query(sql`
        update site_slot_blocks set
            display_order = input.display_order::int
        from (values
          ${inserts(
            changeBlocks.map(block => sql.join([block.slot_id, block.block_id, block.display_order], SQL_COMMA))
          )}
         ) as input(slot_id, block_id, display_order)
        where site_slot_blocks.slot_id = input.slot_id::int and site_slot_blocks.block_id = input.block_id::int;
    `);
  }

  if (toRemove.length) {
    for (const remove of toRemove) {
      // I know this could be a single statement. I'm a coward.
      await context.connection.query(sql`
          delete
          from site_slot_blocks
          where block_id = ${remove} and slot_id = ${slotId}
      `);
    }
  }

  // Add new items with new order
  // Update old items with new order.
  // Remove olds items.

  context.response.body = {
    blocks,
  };
};
