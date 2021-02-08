import { sql } from 'slonik';
import * as editorial from '../database/queries/site-editorial';
import {
  addBlock,
  addSlot,
  BlockJoinedProperties,
  mapBlock,
  mapPage,
  mapSlot,
  PageJoinedColumns,
  pageSlotReducer,
  SlotJoinedProperties,
} from '../database/queries/site-editorial';
import {
  CreateNormalPageRequest,
  CreateSlotRequest,
  SiteBlock,
  SiteBlockRequest,
  SiteSlot,
} from '../types/schemas/site-page';
import { SitePage } from '../types/site-pages-recursive';
import { NotFound } from '../utility/errors/not-found';
import { BaseRepository, Transaction } from './base-repository';

export class PageBlocksRepository extends BaseRepository {
  @Transaction
  async createBlock(blockReq: SiteBlockRequest, siteId: number, slotId?: number): Promise<SiteBlock> {
    const block = await this.connection.one(addBlock(blockReq, siteId));

    if (slotId) {
      const slot = await this.connection.one(
        sql`select id from site_block where site_id = ${siteId} and id = ${slotId}`
      );

      await this.connection.query(sql`
        insert into site_slot_blocks (slot_id, block_id) VALUES (${slot.id}, ${block.id})
      `);
    }

    return mapBlock(block);
  }

  @Transaction
  async createSlot(slotReq: CreateSlotRequest, siteId: number): Promise<SiteSlot> {
    const slot = await this.connection.one(addSlot(slotReq, siteId));

    if (slotReq.pageId) {
      const page = await this.connection.one(
        sql`select id from site_pages where site_id = ${siteId} and id = ${slotReq.pageId}`
      );

      await this.connection.query(sql`
        insert into site_page_slots (slot_id, page_id) VALUES (${slot.id}, ${page.id})
      `);
    }

    const mappedSlot = mapSlot(slot);

    if (slotReq.blocks) {
      const blocks = [];

      for (const block of slotReq.blocks) {
        blocks.push(this.createBlock(block, siteId, slot.id));
      }

      mappedSlot.blocks = await Promise.all(blocks);
    }

    return mappedSlot;
  }

  async createPage(pageReq: CreateNormalPageRequest, siteId: number, user: { id: number; name?: string }) {
    return mapPage(await this.connection.one(editorial.addPage(pageReq, siteId, user)));
  }

  async deleteBlock(blockId: number, siteId: number) {
    await this.connection.query(sql`
      delete from site_block where id = ${blockId} and site_id = ${siteId}
    `);
  }

  async deletePage(pathToFind: string, siteId: number) {
    await this.connection.query(sql`
      delete from site_pages where path = ${pathToFind} and site_id = ${siteId}
    `);
  }

  async deleteSlot(slotId: number, siteId: number) {
    await this.connection.query(sql`
    delete from site_slots where id = ${slotId} and site_id = ${siteId}
  `);
  }

  async getBlockById(blockId: number, siteId: number): Promise<SiteBlock> {
    const results = await this.connection.any(sql<BlockJoinedProperties>`
      select  
          -- Block properties
          sb.id as block__id,
          sb.static_data as block__static_data,
          sb.name as block__name,
          sb.type as block__type,
          sb.lazy as block__lazy,
          sb.i18n_languages as block__i18n_languages,
          sb.i18n_sort_key as block__i18n_sort_key,
          sb.i18n_fallback as block__i18n_fallback
      
      from site_block sb
      where sb.id = ${blockId} and sb.site_id = ${siteId}
    `);

    const table = pageSlotReducer(results);
    return table.blocks[blockId];
  }

  async getPageByPath(pathToFind: string, siteId: number): Promise<SitePage> {
    const results = await this.connection.any(sql<PageJoinedColumns & SlotJoinedProperties & BlockJoinedProperties>`
      select
          -- Page properties
          sp.id as page__id,
          sp.path as page__path,
          sp.title as page__title,
          sp.navigation_title as page__navigation_title,
          sp.description as page__description,
          sp.author_id as page__author_id,
          sp.author_name as page__author_name,
          sp.layout as page__layout,
          sp.parent_page as page__parent_page,
          sp.page_engine as page__page_engine,
          sp.page_options as page__page_options,
          sp.is_navigation_root as page__is_navigation_root,
          sp.hide_from_navigation as page__hide_from_navigation,
          sp.include_in_search as page__include_in_search,
  
          -- Slot properties
          ss.id as slot__id, 
          ss.slot_id as slot__slot_id,
          ss.slot_label as slot__slot_label, 
          ss.slot_layout as slot__slot_layout, 
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
      
      from site_pages sp
          left join site_page_slots sps on sp.id = sps.page_id
          left join site_slots ss on sps.slot_id = ss.id
          left join site_slot_blocks ssb on ss.id = ssb.slot_id
          left join site_block sb on ssb.block_id = sb.id
      where sp.path = ${pathToFind} and sp.site_id = ${siteId}
    `);

    const page = pageSlotReducer(results);
    const singlePage = Object.values(page.pages)[0] as any;

    if (!singlePage) {
      throw new NotFound();
    }

    const slotMap: { [name: string]: SiteSlot } = {};
    for (const slotId of page.page_to_slots[singlePage.id] || []) {
      const slot = page.slots[slotId];
      if (!slot) continue;

      const currentlyMapped = slotMap[slot.slotId];
      if (!currentlyMapped || currentlyMapped.specificity <= slot.specificity) {
        // Edge case when specificity matches.
        if (currentlyMapped && currentlyMapped.specificity === slot.specificity && currentlyMapped.id > slot.id) {
          continue;
        }

        slotMap[slot.slotId] = slot;
        slotMap[slot.slotId].blocks = (page.slot_to_blocks[slotMap[slot.slotId].id] || []).map(
          blockId => page.blocks[blockId]
        );
      }
    }

    (singlePage as any).slots = slotMap;

    return singlePage;
  }
}
