import { InternationalString } from '@hyperion-framework/types/iiif/descriptive';
import { NotFoundError, sql } from 'slonik';
import {
  CreateNormalPageRequest,
  CreateSlotRequest,
  ServerEditorialContext,
  SiteBlock,
  SiteBlockRequest,
  SiteBlockRow,
  SitePageRow,
  SiteSlot,
  SiteSlotRow,
  SlotFilterConfig,
} from '../../types/schemas/site-page';
import { SitePage } from '../../types/site-pages-recursive';
import { SQL_INT_ARRAY } from '../../utility/postgres-tags';

// -- Combo
// @todo Get page + slots + blocks (page + slots)

// Get slots + blocks (context + slots)
// @note this does not filter based on specificity!
// @todo join blocks
export function getContextualSlots(context: ServerEditorialContext, siteId: number, slots?: string[]) {
  const contextQueries = [];

  if (context.project) {
    contextQueries.push(sql`(
        filter_project_all = true or
        filter_project_exact = ${context.project} or
        ${context.project} = any (filter_project_whitelist) or
        (
        not ${context.project} = any (filter_project_blacklist) and
        filter_project_none = false
        )
    )`);
  } else {
    contextQueries.push(sql`
        filter_project_none = true
    `);
  }

  if (context.collection) {
    contextQueries.push(sql`(
        filter_collection_all = true or
        filter_collection_exact = ${context.collection} or
        ${context.collection} = any (filter_collection_whitelist) or
        (
        not ${context.collection} = any (filter_collection_blacklist) and
        filter_collection_none = false
        )
    )`);
  } else {
    contextQueries.push(sql`
        filter_collection_none = true
    `);
  }

  if (context.manifest) {
    contextQueries.push(sql`(
        filter_manifest_all = true or
        filter_manifest_exact = ${context.manifest} or
        ${context.manifest} = any (filter_manifest_whitelist) or
        (
        not ${context.manifest} = any (filter_manifest_blacklist) and
        filter_manifest_none = false
        )
    )`);
  } else {
    contextQueries.push(sql`
        filter_manifest_none = true
    `);
  }

  if (context.canvas) {
    contextQueries.push(sql`(
        filter_canvas_all = true or
        filter_canvas_exact = ${context.canvas} or
        ${context.canvas} = any (filter_canvas_whitelist) or
        (
          not ${context.canvas} = any (filter_canvas_blacklist) and
          filter_canvas_none = false
        )
    )`);
  } else {
    contextQueries.push(sql`
        filter_canvas_none = true
    `);
  }

  if (slots) {
    contextQueries.push(sql`
        slot_id = any ${sql.array(slots, SQL_INT_ARRAY)}
    `);
  }

  if (contextQueries.length === 0) {
    throw new NotFoundError();
  }

  return sql<SlotJoinedProperties & BlockJoinedProperties>`
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
    where
        ${sql.join(contextQueries, sql`and`)}
        and ss.site_id = ${siteId}
  `;
}

// -- Pages
// Add page
export function addPage(page: CreateNormalPageRequest, siteId: number, user: { id: number; name?: string }) {
  return sql<SitePageRow>`
      insert into site_pages (
        path,
        title, 
        navigation_title, 
        description, 
        author_id, 
        author_name, 
        layout, 
        parent_page, 
        page_engine, 
        page_options, 
        is_navigation_root,
        navigation_order,
        hide_from_navigation, 
        include_in_search, 
        site_id
      ) VALUES (
        ${page.path},
        ${sql.json(page.title)},
        ${page.navigationTitle ? sql.json(page.navigationTitle) : null},
        ${page.description ? sql.json(page.description) : null},
        ${user.id},
        ${user.name || 'User'},
        ${page.layout || null},
        ${page.parentPage || null},
        ${page.engine ? page.engine.type : null},
        ${page.engine ? sql.json(page.engine.options) : null},
        ${page.navigationOptions ? page.navigationOptions.root : false},
        ${page.navigationOptions ? page.navigationOptions.order : 0},
        ${page.navigationOptions ? page.navigationOptions.hide : false},
        ${page.searchable || false},
        ${siteId}
      ) returning *
  `;
}

// @todo Page structure
//   Adding / Removing slots

export function getSpecificityDigitFromConfig(config: SlotFilterConfig) {
  if (config.exact) {
    return 4;
  }
  if (config.whitelist) {
    return 3;
  }
  if (config.blacklist) {
    return 2;
  }
  if (config.all) {
    return 1;
  }
  return 0;
}

export function getSpecificity(config: CreateSlotRequest['filters']) {
  let specificity = 0;

  if (!config) {
    return specificity;
  }

  if (config.project) {
    specificity += getSpecificityDigitFromConfig(config.project) * 1;
  }

  if (config.collection) {
    specificity += getSpecificityDigitFromConfig(config.collection) * 10;
  }

  if (config.manifest) {
    specificity += getSpecificityDigitFromConfig(config.manifest) * 100;
  }

  if (config.canvas) {
    specificity += getSpecificityDigitFromConfig(config.canvas) * 1000;
  }

  return specificity;
}

export function parseFilter(config?: SlotFilterConfig) {
  const defaultReturn = {
    exact: null,
    whitelist: null,
    blacklist: null,
    all: false,
    none: false,
  };

  if (config) {
    if (config.exact) {
      return {
        ...defaultReturn,
        exact: config.exact,
      };
    }
    if (config.whitelist) {
      return {
        ...defaultReturn,
        whitelist: sql.array(config.whitelist, 'int' as any),
      };
    }
    if (config.blacklist) {
      return {
        ...defaultReturn,
        blacklist: sql.array(config.blacklist, 'int' as any),
      };
    }
    if (config.all) {
      return {
        ...defaultReturn,
        all: true,
      };
    }
  }

  return {
    ...defaultReturn,
    none: true,
  };
}

export type PageJoinedColumns = {
  page__id: number;
  page__path: string;
  page__previous_paths?: string[];
  page__title: InternationalString;
  page__navigation_title?: InternationalString;
  page__description?: InternationalString;
  page__created: number;
  page__modified: number;
  page__author_id: string;
  page__author_name: string;
  page__layout?: string;
  page__parent_page: number;
  page__page_engine?: string;
  page__page_options?: any;
  page__is_post: boolean;
  page__slug?: string;
  page__is_navigation_root: boolean;
  page__navigation_order: number;
  page__hide_from_navigation: boolean;
  page__include_in_search: boolean;
};

export type SlotJoinedProperties = {
  // Slot properties
  slot__id: number;
  slot__slot_id: string;
  slot__slot_label?: InternationalString;
  slot__slot_layout: string;
  slot__specificity: number;
  slot__site_id: number;
  slot__slot_props?: any;

  // Filter projects
  slot__filter_project_none: boolean;
  slot__filter_project_all: boolean;
  slot__filter_project_exact: number;
  slot__filter_project_whitelist?: number[];
  slot__filter_project_blacklist?: number[];

  // Filter collections
  slot__filter_collection_none: boolean;
  slot__filter_collection_all: boolean;
  slot__filter_collection_exact: number;
  slot__filter_collection_whitelist?: number[];
  slot__filter_collection_blacklist?: number[];

  // Filter manifests
  slot__filter_manifest_none: boolean;
  slot__filter_manifest_all: boolean;
  slot__filter_manifest_exact: number;
  slot__filter_manifest_whitelist?: number[];
  slot__filter_manifest_blacklist?: number[];

  // Filter canvases
  slot__filter_canvas_none: boolean;
  slot__filter_canvas_all: boolean;
  slot__filter_canvas_exact: number;
  slot__filter_canvas_whitelist?: number[];
  slot__filter_canvas_blacklist?: number[];
};

export type BlockJoinedProperties = {
  // Block properties.
  block__id: number;
  block__name: string;
  block__type: string;
  block__static_data: any;
  block__lazy: boolean;
  block__order?: number;
  block__i18n_languages?: string[];
  block__i18n_sort_key?: string;
  block__i18n_fallback?: boolean;
};

function isPageQuery(input: any): input is PageJoinedColumns {
  return !!input.page__id;
}

function isSlotQuery(input: any): input is SlotJoinedProperties {
  return !!input.slot__id;
}
function isBlockQuery(input: any): input is BlockJoinedProperties {
  return !!input.block__id;
}

export type PageSlotReducer<P extends number = any, S extends number = any, B extends number = any> = {
  pages: {
    [key in P]: SitePage;
  };
  slots: {
    [key in S]: SiteSlot;
  };
  blocks: {
    [key in B]: SiteBlock;
  };
  page_to_slots: {
    [key in P]: S[];
  };
  slot_to_blocks: {
    [key in S]: B[];
  };
};

export function mapBlock(page: SiteBlockRow): SiteBlock;
export function mapBlock(page: BlockJoinedProperties, prefix: 'block__'): SiteBlock;
export function mapBlock(block: any, prefix = ''): SiteBlock {
  return {
    id: block[prefix + 'id'],
    lazy: block[prefix + 'lazy'],
    name: block[prefix + 'name'],
    type: block[prefix + 'type'],
    static_data: block[prefix + 'static_data'],
    order: block[prefix + 'order'],
    i18n: block[prefix + 'i18n_languages']
      ? {
          languages: block[prefix + 'i18n_languages'],
          sortKey: block[prefix + 'i18n_sort_key'],
          fallback: block[prefix + 'i18n_fallback'],
        }
      : undefined,
  };
}

export function mapSlot(page: SiteSlotRow): SiteSlot;
export function mapSlot(page: SlotJoinedProperties, prefix: 'slot__'): SiteSlot;
export function mapSlot(slot: any, prefix = ''): SiteSlot {
  return {
    id: slot[prefix + 'id'],
    slotId: slot[prefix + 'slot_id'],
    label: slot[prefix + 'slot_label'],
    layout: slot[prefix + 'slot_layout'],
    specificity: slot[prefix + 'specificity'],
    props: slot[prefix + 'slot_props'],
    blocks: [],
    filters: {
      project: {
        none: slot[prefix + 'filter_project_none'] || undefined,
        blacklist: slot[prefix + 'filter_project_blacklist'] || undefined,
        whitelist: slot[prefix + 'filter_project_whitelist'] || undefined,
        exact: slot[prefix + 'filter_project_exact'] || undefined,
        all: slot[prefix + 'filter_project_all'] || undefined,
      },
      collection: {
        none: slot[prefix + 'filter_collection_none'] || undefined,
        blacklist: slot[prefix + 'filter_collection_blacklist'] || undefined,
        whitelist: slot[prefix + 'filter_collection_whitelist'] || undefined,
        exact: slot[prefix + 'filter_collection_exact'] || undefined,
        all: slot[prefix + 'filter_collection_all'] || undefined,
      },
      manifest: {
        none: slot[prefix + 'filter_manifest_none'] || undefined,
        blacklist: slot[prefix + 'filter_manifest_blacklist'] || undefined,
        whitelist: slot[prefix + 'filter_manifest_whitelist'] || undefined,
        exact: slot[prefix + 'filter_manifest_exact'] || undefined,
        all: slot[prefix + 'filter_manifest_all'] || undefined,
      },
      canvas: {
        none: slot[prefix + 'filter_canvas_none'] || undefined,
        blacklist: slot[prefix + 'filter_canvas_blacklist'] || undefined,
        whitelist: slot[prefix + 'filter_canvas_whitelist'] || undefined,
        exact: slot[prefix + 'filter_canvas_exact'] || undefined,
        all: slot[prefix + 'filter_canvas_all'] || undefined,
      },
    },
  };
}

export function mapPage(page: SitePageRow): SitePage;
export function mapPage(page: PageJoinedColumns, prefix: 'page__'): SitePage;
export function mapPage(page: any, prefix = ''): SitePage {
  return {
    id: page[prefix + 'id'],
    path: page[prefix + 'path'],
    slug: page[prefix + 'slug'],
    previousPaths: page[prefix + 'previous_paths'],
    title: page[prefix + 'title'],
    navigationTitle: page[prefix + 'navigation_title'],
    description: page[prefix + 'description'],
    created: page[prefix + 'created'],
    modified: page[prefix + 'modified'],
    author: {
      id: page[prefix + 'author_id'],
      name: page[prefix + 'author_name'],
    },
    engine: page[prefix + 'page_engine']
      ? {
          type: page[prefix + 'page_engine'],
          options: page[prefix + 'page_options'],
        }
      : undefined,
    searchable: page[prefix + 'include_in_search'],
    navigationOptions: {
      hide: page[prefix + 'hide_from_navigation'],
      root: page[prefix + 'is_navigation_root'],
      order: page[prefix + 'navigation_order'],
    },
    parentPage: page[prefix + 'parent_page'],
    layout: page[prefix + 'layout'],
    slots: {},
  };
}

export function pageSlotReducer<
  T extends
    | (PageJoinedColumns & SlotJoinedProperties & BlockJoinedProperties)
    | (SlotJoinedProperties & BlockJoinedProperties)
    | BlockJoinedProperties
    | PageJoinedColumns
>(results: ReadonlyArray<T>) {
  const page: PageSlotReducer = {
    pages: {},
    slots: {},
    blocks: {},
    page_to_slots: {},
    slot_to_blocks: {},
  };

  for (const result of results) {
    if (isPageQuery(result) && !page.pages[result.page__id]) {
      page.pages[result.page__id] = mapPage(result, 'page__');
    }

    if (isSlotQuery(result) && !page.slots[result.slot__id]) {
      page.slots[result.slot__id] = mapSlot(result, 'slot__');

      if (isPageQuery(result)) {
        page.page_to_slots[result.page__id] = page.page_to_slots[result.page__id]
          ? page.page_to_slots[result.page__id]
          : [];
        page.page_to_slots[result.page__id].push(result.slot__id);
      }
    }

    if (isBlockQuery(result) && !page.blocks[result.block__id]) {
      page.blocks[result.block__id] = mapBlock(result, 'block__');

      if (isSlotQuery(result)) {
        page.slot_to_blocks[result.slot__id] = page.slot_to_blocks[result.slot__id]
          ? page.slot_to_blocks[result.slot__id]
          : [];
        page.slot_to_blocks[result.slot__id].push(result.block__id);
      }
    }
  }

  return page;
}

// -- Slots
// Add slot
export function addSlot(slot: CreateSlotRequest, siteId: number) {
  const specificity = getSpecificity(slot.filters);

  const project = parseFilter(slot.filters?.project);
  const collection = parseFilter(slot.filters?.collection);
  const manifest = parseFilter(slot.filters?.manifest);
  const canvas = parseFilter(slot.filters?.canvas);

  return sql<SiteSlotRow>`
    insert into site_slots (
      slot_id,
      slot_label, 
      slot_layout, 
      filter_project_none, 
      filter_project_all, 
      filter_project_exact, 
      filter_project_whitelist, 
      filter_project_blacklist, 
      filter_collection_none, 
      filter_collection_all, 
      filter_collection_exact, 
      filter_collection_whitelist, 
      filter_collection_blacklist, 
      filter_manifest_none, 
      filter_manifest_all, 
      filter_manifest_exact, 
      filter_manifest_whitelist, 
      filter_manifest_blacklist, 
      filter_canvas_none, 
      filter_canvas_all, 
      filter_canvas_exact, 
      filter_canvas_whitelist, 
      filter_canvas_blacklist, 
      specificity, 
      site_id
    ) VALUES (
      ${slot.slotId},
      ${slot.label ? sql.json(slot.label) : null},
      ${slot.layout},
      ${project.none},
      ${project.all},
      ${project.exact},
      ${project.whitelist},
      ${project.blacklist},

      ${collection.none},
      ${collection.all},
      ${collection.exact},
      ${collection.whitelist},
      ${collection.blacklist},

      ${manifest.none},
      ${manifest.all},
      ${manifest.exact},
      ${manifest.whitelist},
      ${manifest.blacklist},

      ${canvas.none},
      ${canvas.all},
      ${canvas.exact},
      ${canvas.whitelist},
      ${canvas.blacklist},
      ${specificity},
      ${siteId}
    ) returning *
  `;
}

// Edit slot
export function editSlot(id: number, slot: CreateSlotRequest, siteId: number) {
  const specificity = getSpecificity(slot.filters);

  const project = parseFilter(slot.filters?.project);
  const collection = parseFilter(slot.filters?.collection);
  const manifest = parseFilter(slot.filters?.manifest);
  const canvas = parseFilter(slot.filters?.canvas);

  return sql<SiteSlotRow>`
    update site_slots set

      slot_label=${slot.label ? sql.json(slot.label) : null},
      slot_layout=${slot.layout},
      slot_props=${sql.json(slot.props || {})},

      filter_project_none=${project.none}, 
      filter_project_all=${project.all}, 
      filter_project_exact=${project.exact}, 
      filter_project_whitelist=${project.whitelist}, 
      filter_project_blacklist=${project.blacklist},
    
      filter_collection_none=${collection.none}, 
      filter_collection_all=${collection.all}, 
      filter_collection_exact=${collection.exact}, 
      filter_collection_whitelist=${collection.whitelist}, 
      filter_collection_blacklist=${collection.blacklist},
    
      filter_manifest_none=${manifest.none}, 
      filter_manifest_all=${manifest.all}, 
      filter_manifest_exact=${manifest.exact}, 
      filter_manifest_whitelist=${manifest.whitelist}, 
      filter_manifest_blacklist=${manifest.blacklist},
    
      filter_canvas_none=${canvas.none}, 
      filter_canvas_all=${canvas.all}, 
      filter_canvas_exact=${canvas.exact}, 
      filter_canvas_whitelist=${canvas.whitelist}, 
      filter_canvas_blacklist=${canvas.blacklist},
      specificity=${specificity}
    where site_id = ${siteId} and id = ${id} returning *
  `;
}

// Remove slot
export function deleteSlot(id: number, siteId: number) {
  return sql`
    delete from site_slots where site_id = ${siteId} and id = ${id}
  `;
}

// @todo Slot structure

// -- Blocks
// Add block
export function addBlock(block: SiteBlockRequest, siteId: number) {
  return sql<SiteBlockRow>`
    insert into site_block 
        (name, type, static_data, lazy, i18n_languages, i18n_sort_key, i18n_fallback, site_id) 
        VALUES (
          ${block.name || ''}, 
          ${block.type}, 
          ${block.static_data ? sql.json(block.static_data) : null},
          ${block.lazy || false},
          ${block.i18n ? sql.array(block.i18n.languages, 'text') : null},
          ${block.i18n ? block.i18n.sortKey || null : null},
          ${block.i18n ? block.i18n.fallback || null : null},
          ${siteId}
        ) 
    returning *
  `;
}

// Edit block
export function editBlock(id: number, block: SiteBlockRequest, siteId: number) {
  return sql<SiteBlockRow>`
    update site_block set
      name=${block.name || ''},
      type=${block.type},
      static_data=${block.static_data ? sql.json(block.static_data) : null},
      i18n_languages=${block.i18n ? sql.array(block.i18n.languages, 'text') : null},
      i18n_sort_key=${block.i18n ? block.i18n.sortKey || null : null},
      i18n_fallback=${block.i18n ? block.i18n.fallback || null : null},
      lazy=${block.lazy || false}
    where id = ${id} and site_id = ${siteId} returning *
  `;
}

export function editPage(id: number, page: CreateNormalPageRequest, siteId: number) {
  return sql<SitePageRow>`
    update site_pages set
      path=${page.path},
      title=${sql.json(page.title)},
      navigation_title=${page.navigationTitle ? sql.json(page.navigationTitle) : null}, 
      description=${page.description ? sql.json(page.description) : null}, 
      layout=${page.layout || null}, 
      parent_page=${page.parentPage || null}, 
      page_engine=${page.engine ? page.engine.type : null}, 
      page_options=${page.engine ? sql.json(page.engine.options) : null}, 
      is_navigation_root=${page.navigationOptions ? page.navigationOptions.root : false}, 
      hide_from_navigation=${page.navigationOptions ? page.navigationOptions.hide : false},
      navigation_order=${page.navigationOptions ? page.navigationOptions.order : 0}, 
      include_in_search=${page.searchable || false},
      modified = CURRENT_TIMESTAMP
    where id = ${id} and site_id = ${siteId} returning *
  `;
}

// -- Misc
// @todo Get pagination for slugged items
// @todo Generate navigation tree
