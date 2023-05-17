import { Pagination } from '../../../types/schemas/_pagination';
import { Canvas, Collection, InternationalString, Manifest } from '@iiif/presentation-3';

/** RESOURCE */
export interface EnrichmentResourceList {
  pagination: Pagination;
  results: EnrichmentResourceSnippet[];
}
export interface EnrichmentResourceSnippet {
  url: string; // why isnt this madoc_url ?
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
  type: string; // manifest | canvas
  thumbnail?: string;
  iiif_json: Manifest | Canvas | Collection;
  canvases?: {
    url: string;
    created: string;
    modified: string;
    madoc_id?: string;
    type?: string;
    thumbnail?: string;
  }[];
  manifests?: {
    url: string;
    created: string;
    modified: string;
    madoc_id?: string;
    type?: string;
    thumbnail?: string;
  }[];
  ocr_resources?: any;
  entity_tags?: EntityTagSnippet[];
  // no label??
}
export type ResourceQuery = {
  /** madoc_id required for update only - Unique identifier of the MadocResource of the form */
  madoc_id: string;
  madoc_url?: string;
  type: 'canvas' | 'manifest';
  iiif_json: string;
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
  entity: string; // madoc url ??
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
export interface EntitiesMadocResponse {
  pagination: Pagination;
  results: EnrichmentEntitySnippet[];
}
export interface EnrichmentEntitySnippet {
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
  other_data: {
    thumbnail: {
      id: string;
      url: string;
      alt: InternationalString;
    };
  };
}
export interface EntityMadocResponse {
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
  description: InternationalString;
  featured_resources?: FeaturedResource[]; //todo check
  related_topics: EnrichmentEntitySnippet[]; // todo check
  authorities: AuthoritySnippet[];
  tagged_resource_count: number;
  other_data?: EntityOtherData;
}
export interface EntityOtherData {
  main_image?: {
    id?: string;
    alt?: InternationalString;
    height?: string;
    width?: string;
    url: string;
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
}
export interface FeaturedResource {
  // this could be the same as the enrichment resource snippet??
  url: string;
  created: string;
  modified: string;
  madoc_id?: string;
  type: 'canvas' | 'manifest';
  label?: InternationalString;
  thumbnail?: string;
  metadata?: any; // ?
  other_data?: any; // ?
  count: number;
}
export interface EnrichmentEntityAuthority {
  id: string;
  authority: string;
  identifier: string;
}
export type EntityQuery = {
  /** madoc_id required for update only - Unique identifier of the MadocResource of the form */
  id?: string; // Required for Update only
  label?: string; // Required for create only (used for slug)
  title?: InternationalString;
  description?: InternationalString;
  featured_resources?: FeaturedResource[];
  other_data?: EntityOtherData;
};
export interface EnrichmentEntityAutoCompleteResponse {
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
  type_title?: InternationalString;
  slug: string;
  title?: InternationalString; // in the docs but not coming back
  label?: string; //not in the docs but is coming back
}

/** ENTITY TYPE */
export interface EntityTypesMadocResponse {
  pagination: Pagination;
  results: EnrichmentEntityTypeSnippet[];
}
export interface EnrichmentEntityTypeSnippet {
  url: string;
  id: string;
  created: string;
  modified: string;
  label: string;
  slug: string;
  title: InternationalString;
  topic_count: number | string;
  other_data: {
    thumbnail?: {
      url?: string;
    };
  };
}
export interface EntityTypeMadocResponse {
  url: string;
  id: string;
  created: string;
  modified: string;
  label: string;
  slug: string;
  title?: InternationalString;
  description?: InternationalString;
  image_url?: string;
  featured_topics?: EnrichmentEntitySnippet[];
  other_data?: any;
}
export interface EnrichmentEntityType extends EnrichmentEntityTypeSnippet {
  description: InternationalString;
  featured_topics?: EnrichmentEntitySnippet[];
  image_url: string;
} //DELETE THIS
export type EntityTypeQuery = {
  id?: string; // Required for Update only
  label?: string; // Required for create only (used for slug)
  title?: InternationalString;
  description?: InternationalString;
  image_url?: string;
  featured_resources?: FeaturedResource[];
  other_data?: any;
};
export interface EnrichmentEntity {
  url: string;
  id: string;
  modified: string;
  created: string;
  label: string;
  type: SpaCyNERType | null;
  type_slug: string;
  type_title: InternationalString;
  slug: string;
  title: InternationalString;
  tagged_resource_count: number;
  description: InternationalString;
  featured_resources: FeaturedResource[];
  related_topics: EnrichmentEntitySnippet[];
  authorities: AuthoritySnippet[];
  other_data?: EntityOtherData;
}
export interface EntityTagSnippet {
  tag_id: string;
  entity: {
    type_slug: string;
    slug: string;
    url: string;
    id: string;
    type: string;
    label: string;
  };
  selector?: any;
}
export interface AuthoritySnippet {
  // id: string;
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
