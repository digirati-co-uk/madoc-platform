import { Canvas, Collection, InternationalString, Manifest } from '@iiif/presentation-3';
import { Pagination } from '../../types/schemas/_pagination';

/** RESOURCE */
export interface EnrichmentResourceList {
  pagination: Pagination;
  results: EnrichmentResourceSnippet[];
}
export interface EnrichmentResourceSnippet {
  url: string;
  created: string;
  modified: string;
  madoc_id: string; // URN
  type: 'canvas' | 'manifest';
  thumbnail: string;
  // no label?
}
export interface EnrichmentResource {
  url: string;
  created: string;
  modified: string;
  madoc_id: string; // URN
  type: 'canvas' | 'manifest';
  thumbnail?: string;
  iiif_json: Manifest | Canvas | Collection;
  canvases?: [];
  manifests?: [];
  ocr_resources?: [];
  entity_tags?: EntityTagSnippet[];
  // no label??
}
export type ResourceQuery = {
  madoc_id: string;
  madoc_url: string;
  type: 'canvas' | 'manifest';
  iiif_json?: string;
  label?: InternationalString;
};
export interface ResourceQueryResponse {
  id: string; // why isnt this madoc_id ?
  created: string;
  modified: string;
  madoc_url?: string;
  contexts: any; // dunno what this is
  thumbnail: string;
  type: 'manifest' | 'canvas';
  iiif_json: string;
  label: InternationalString;
}

/** RESOURCE TAG */
export interface ResourceTagList {
  pagination: Pagination;
  results: ResourceTagSnippet[];
}
export interface ResourceTagSnippet {
  url: string;
  id: string;
  entity: string;
  selector?: [number, number];
}
export interface ResourceTag {
  url: string;
  id: string;
  created: string;
  modified: string;
  entity: string;
  selector: [number, number];
  resource_id: string;
  resource_content_type_id: number;
}

/** ENTITY */
export interface EntitiesListResponse {
  pagination: Pagination;
  results: EntitySnippet[];
}
export interface EntitySnippet {
  url: string;
  id: string;
  created: string;
  modified: string;
  label: string;
  type: SpaCyNERType | null;
  type_slug: string;
  type_title: InternationalString;
  slug: string;
  title: InternationalString;
  tagged_resource_count: number;
  other_data?: {
    thumbnail?: {
      id?: string;
      url?: string;
      alt?: InternationalString;
    };
  };
}
export interface EntityFull {
  url: string;
  id: string;
  created: string;
  modified: string;
  type: SpaCyNERType | null;
  type_slug: string;
  type_title: InternationalString;
  label: string;
  slug: string;
  title: InternationalString;
  description?: InternationalString;
  featured_resources?: FeaturedResource[];
  related_topics: EntitySnippet[];
  authorities: AuthoritySnippet[];
  tagged_resource_count: number;
  other_data?: EntityOtherData;
}
export interface EntityOtherData {
  aliases?: InternationalString;
  main_image?: {
    id?: string;
    alt?: InternationalString;
    height?: string;
    width?: string;
    url?: string;
  };
  thumbnail?: {
    id?: string;
    alt?: InternationalString;
    height?: string;
    width?: string;
    url: string;
  };
  topic_summary?: InternationalString;
  secondary_heading?: InternationalString;
  coordinates?: any; // dunno what this is yet
}
export interface FeaturedResource {
  url: string;
  created: string;
  modified: string;
  madoc_id?: string;
  type: 'canvas' | 'manifest';
  label?: InternationalString;
  thumbnail?: string;
  metadata?: any; // ?
  other_data?: any; // ?
  tagged_resource_count: number;
}
export interface EnrichmentEntityAuthority {
  id: string;
  authority: string;
  identifier: string;
}
export type EntityQuery = {
  id?: string; // Required for update only
  type_slug?: string; // Required for create only (used for slug)
  label: string; // Uniqueness is not enforced. A unique slug is made.
  title?: InternationalString;
  description?: InternationalString;
  featured_resources?: string[]; // eg ['urn:madoc:manifest:1', urn:madoc:manifest:2'] manifest only
  other_data?: EntityOtherData;
};
export interface EntityAutoCompleteResponse {
  pagination: Pagination;
  results: AutoCompleteEntitySnippet[];
  facets?: any;
}
export interface AutoCompleteEntitySnippet {
  url: string;
  id: string;
  created: string;
  modified: string;
  type_slug: string;
  type_title: InternationalString;
  type_label: string;
  slug: string;
  title: InternationalString; // in the docs but not coming back
  label: string;
}

/** ENTITY TYPE */
export interface EntityTypesListResponse {
  pagination: Pagination;
  results: EntityTypeSnippet[];
}
export interface EntityTypeSnippet {
  url: string;
  id: string;
  created: string;
  modified: string;
  label: string;
  slug: string;
  title: InternationalString;
  topic_count: number;
  other_data?: {
    thumbnail?: {
      url?: string;
    };
  };
}
export interface EntityTypeFull {
  url: string;
  id: string;
  created: string;
  modified: string;
  label: string;
  slug: string;
  title?: InternationalString;
  description?: InternationalString;
  image_url?: string;
  featured_topics?: EntitySnippet[];
  topic_count: number;
  other_data?: {
    main_image: {
      url?: string;
    };
  };
}
export type EntityTypeQuery = {
  id?: string; // Required for Update only
  label: string; // Required
  title?: InternationalString;
  description?: InternationalString;
  image_url?: string;
  featured_topics?: FeaturedResource[];
  other_data?: {
    main_image?: string;
    thumbnail?: string;
  };
};
export interface EntityTypeAutoCompleteResponse {
  pagination: Pagination;
  results: AutoCompleteEntityTypeSnippet[];
}
export interface AutoCompleteEntityTypeSnippet {
  url: string;
  id: string;
  created: string;
  modified: string;
  slug: string;
  title: InternationalString;
  label: string;
}

export interface EntityTagSnippet {
  tag_id: string;
  entity: {
    url: string;
    id: string;
    type: string;
    type_slug: string;
    slug: string;
    label: string;
  };
  selector?: any;
}
export interface AuthoritySnippet {
  url: string;
  authority: string;
  identifier: string;
}
export interface Authority extends AuthoritySnippet {
  base_data_url: string;
  base_url: string;
}

export type SpaCyNERType =
  | 'PERSON'
  | 'NORP'
  | 'FAC'
  | 'ORG'
  | 'GPE'
  | 'LOC'
  | 'PRODUCT'
  | 'EVENT'
  | 'WORK_OF_ART'
  | 'LAW'
  | 'LANGUAGE'
  | 'DATE'
  | 'TIME'
  | 'PERCENT'
  | 'MONEY'
  | 'QUANTITY'
  | 'ORDINAL'
  | 'CARDINAL';

export type EnrichmentIndexPayload = {
  madoc_id: string;
  label: InternationalString;
  type: 'manifest' | 'canvas' | 'collection';
  madoc_url: string;
  thumbnail: string;
  iiif_json: Manifest | Canvas | Collection;
  contexts: string[];
};

export interface DjangoPagination<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}
