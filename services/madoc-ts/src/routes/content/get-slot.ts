import { sql } from 'slonik';
import { BlockJoinedProperties, pageSlotReducer, SlotJoinedProperties } from '../../database/queries/site-editorial';
import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const getSlot: RouteMiddleware<{ slotId: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.read']);
  const slotId = Number(context.params.slotId);

  const results = await context.connection.any(sql<SlotJoinedProperties & BlockJoinedProperties>`
    select
        -- Slot properties
        ss.id as slot__id, 
        ss.slot_id as slot__slot_id,
        ss.slot_label as slot__slot_label, 
        ss.slot_layout as slot__slot_layout,
        ss.slot_props as slot__slot_props,
        ss.specificity as slot__specificity, 
        ss.site_id as slot__site_id, 
        ss.filter_project_none as slot__filter_project_none, 
        ss.filter_project_all as slot__filter_project_all, 
        ss.filter_project_exact as slot__filter_project_exact, 
        ss.filter_project_whitelist as slot__filter_project_whitelist, 
        ss.filter_project_blacklist as slot__filter_project_blacklist, 
        ss.filter_collection_none as slot__filter_collection_none, 
        ss.filter_collection_all as slot__filter_collection_all, 
        ss.filter_collection_exact as slot__filter_collection_exact, 
        ss.filter_collection_whitelist as slot__filter_collection_whitelist, 
        ss.filter_collection_blacklist as slot__filter_collection_blacklist, 
        ss.filter_manifest_none as slot__filter_manifest_none, 
        ss.filter_manifest_all as slot__filter_manifest_all, 
        ss.filter_manifest_exact as slot__filter_manifest_exact, 
        ss.filter_manifest_whitelist as slot__filter_manifest_whitelist, 
        ss.filter_manifest_blacklist as slot__filter_manifest_blacklist, 
        ss.filter_canvas_none as slot__filter_canvas_none, 
        ss.filter_canvas_all as slot__filter_canvas_all, 
        ss.filter_canvas_exact as slot__filter_canvas_exact, 
        ss.filter_canvas_whitelist as slot__filter_canvas_whitelist, 
        ss.filter_canvas_blacklist as slot__filter_canvas_blacklist, 
        
        -- Block properties
        sb.id as block__id,
        sb.static_data as block__static_data,
        sb.name as block__name,
        sb.type as block__type,
        sb.lazy as block__lazy,
        ssb.display_order as block__order,
        sb.i18n_languages as block__i18n_languages,
        sb.i18n_sort_key as block__i18n_sort_key,
        sb.i18n_fallback as block__i18n_fallback
    
    from site_slots ss
        left join site_slot_blocks ssb on ss.id = ssb.slot_id
        left join site_block sb on ssb.block_id = sb.id
    where ss.id = ${slotId} and ss.site_id = ${siteId}
  `);

  const table = pageSlotReducer(results);
  const slot = table.slots[slotId];

  context.response.body = {
    slot: { ...slot, blocks: (table.slot_to_blocks[slot.id] || []).map((blockId: string) => table.blocks[blockId]) },
  };
};
