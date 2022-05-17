import { InternationalString } from '@iiif/presentation-3';

export type EditorialContext = {
  project?: string;
  collection?: number;
  manifest?: number;
  canvas?: number;
  page?: number;
  slotIds?: string[];
};

export type ServerEditorialContext = {
  project?: number;
  collection?: number;
  manifest?: number;
  canvas?: number;
  page?: number;
  slotIds?: string[];
};

export type SlotResponse = {
  slots: SiteSlot[];
};

export type SiteSlot = {
  id: number;
  specificity: number;
  slotId: string;
  label?: InternationalString;
  layout: string;
  props?: any;
  filters?: {
    project?: SlotFilterConfig;
    collection?: SlotFilterConfig;
    manifest?: SlotFilterConfig;
    canvas?: SlotFilterConfig;
  };
  pageId?: number;
  blocks: SiteBlock[];
};

export type SiteBlock = SiteBlockRequest & { id: number; order?: number };

export type CreateNormalPageRequest = {
  path: string;
  title: InternationalString;
  navigationTitle?: InternationalString;
  description?: InternationalString;
  layout?: string;
  parentPage?: number;
  engine?: {
    type: string;
    options: any;
  };
  navigationOptions?: {
    hide: boolean;
    root: boolean;
    order: number;
  };
  searchable?: boolean;
  slug?: string;
};

export type SlotFilterConfig = {
  none?: boolean;
  all?: boolean;
  exact?: number;
  whitelist?: number[];
  blacklist?: number[];
};

export type CreateSlotRequest = {
  slotId: string;
  label?: InternationalString;
  layout: string;
  props?: any;
  filters?: {
    project?: SlotFilterConfig;
    collection?: SlotFilterConfig;
    manifest?: SlotFilterConfig;
    canvas?: SlotFilterConfig;
  };
  pageId?: number;
  blocks?: SiteBlockRequest[];
};

export type SlotMappingRequest = {
  project?: { [slotName: string]: CreateSlotRequest };
  collection?: { [slotName: string]: CreateSlotRequest };
  manifest?: { [slotName: string]: CreateSlotRequest };
  canvas?: { [slotName: string]: CreateSlotRequest };
};

export type SitePageRow = {
  id: number;
  path: string;
  previous_paths?: string[];
  title: InternationalString;
  navigation_title?: InternationalString;
  description?: InternationalString;
  created: number;
  modified: number;
  author_id: string;
  author_name: string;
  layout?: string;
  parent_page: number;
  page_engine?: string;
  page_options?: any;
  is_post: boolean;
  slug?: string;
  is_navigation_root: boolean;
  navigation_order: number;
  hide_from_navigation: boolean;
  include_in_search: boolean;
};

export type SiteSlotRow = {
  id: number;
  slot_label?: InternationalString;
  slot_props?: any;
  slot_layout: string;
  specificity: number;
  site_id: number;

  // Filter projects
  filter_project_none: boolean;
  filter_project_all: boolean;
  filter_project_exact: number;
  filter_project_whitelist?: number[];
  filter_project_blacklist?: number[];

  // Filter collections
  filter_collection_none: boolean;
  filter_collection_all: boolean;
  filter_collection_exact: number;
  filter_collection_whitelist?: number[];
  filter_collection_blacklist?: number[];

  // Filter manifests
  filter_manifest_none: boolean;
  filter_manifest_all: boolean;
  filter_manifest_exact: number;
  filter_manifest_whitelist?: number[];
  filter_manifest_blacklist?: number[];

  // Filter canvases
  filter_canvas_none: boolean;
  filter_canvas_all: boolean;
  filter_canvas_exact: number;
  filter_canvas_whitelist?: number[];
  filter_canvas_blacklist?: number[];
};

export type SiteBlockRow = {
  id: number;
  name: string;
  type: string;
  static_data: any;
  lazy: boolean;
  site_id: number;
  i18n_languages?: string[];
  i18n_sort_key?: string;
  i18n_fallback?: boolean;
};

export type SiteBlockRequest = {
  name: string;
  type: string;
  static_data: any;
  lazy: boolean;
  order?: number;
  i18n?: {
    languages: string[];
    sortKey?: string;
    fallback?: boolean;
  };
};
