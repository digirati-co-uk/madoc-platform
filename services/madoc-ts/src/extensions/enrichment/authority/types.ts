import { Pagination } from '../../../types/schemas/_pagination';
import { InternationalString } from '@iiif/presentation-3';

export interface AuthoritySnippet {
  id: string;
  url: string;
  authority: string;
  // identifier: string;
}

export interface Authority extends AuthoritySnippet {
  base_data_url: string;
  base_url: string;
}

export interface EnrichmentEntitySnippet {
  /**
   * URL of the Entity (won't resolve due to Gateway)
   */
  url: string;

  /**
   * Unique identifier of the Entity (UUID)
   */
  id: string;

  /**
   * Creation time of the Entity (ISO Timestamp)
   */
  created: string;
  /**
   * Last modification time of the Entity (ISO Timestamp)
   */
  modified: string;
  /**
   * Unique label - not typically for display. For example, it might come from an external vocab with all caps: "TRIBE"
   * and the label to display to the user may be simply "Tribe"
   */
  label: string;
  /**
   * [SpaCy NER type](https://github.com/digirati-co-uk/madoc-enrichment/blob/main/endpoint_docs.md#spacy-named-entity-recognition-ner-types)
   *
   * PERSON - People, including fictional.
   * NORP - Nationalities or religious or political groups.
   * FAC - Buildings, airports, highways, bridges, etc.
   * ORG - Companies, agencies, institutions, etc.
   * GPE - Countries, cities, states.
   * LOC - Non-GPE locations, mountain ranges, bodies of water.
   * PRODUCT - Objects, vehicles, foods, etc. (Not services.)
   * EVENT - Named hurricanes, battles, wars, sports events, etc.
   * WORK_OF_ART - Titles of books, songs, etc.
   * LAW - Named documents made into laws.
   * LANGUAGE - Any named language.
   * DATE - Absolute or relative dates or periods.
   * TIME - Times smaller than a day.
   * PERCENT - Percentage, including "%".
   * MONEY - Monetary values, including unit.
   * QUANTITY - Measurements, as of weight or distance.
   * ORDINAL - "first", "second", etc.
   * CARDINAL - Numerals that do not fall under another type
   */
  type: SpaCyNERType | null;

  /**
   * Slug of the Entity's Type. (for navigation)
   */
  type_slug: string;

  /**
   * Readable labels for the Entity's Type.
   */
  type_title: InternationalString;

  /**
   * A unique slug, derived from the label
   */
  slug: string;

  /**
   * Readable title for the Entity.
   */
  title: InternationalString;

  /**
   *  Number of tagged Resources on each Entity.
   */
  tagged_resource_count: number;

  /**
   * contains thumbnail data
   */
  other_data: {
    thumbnail: {
      id: string;
      url: string;
      alt: InternationalString;
    };
  };
}

export interface EnrichmentEntityAuthority {
  url: string;
  id: string;
  authority: string;
  identifier: string;
}

/**
 * Entity - List item
 *
 * Documentation: https://github.com/digirati-co-uk/madoc-enrichment/blob/main/endpoint_docs.md#entity---list
 */
export interface EnrichmentEntityTypeSnippet {
  /**
   * URL of the Entity (won't resolve due to Gateway)
   */
  url: string;

  /**
   * Unique identifier of the Entity (UUID)
   */
  id: string;

  /**
   * Creation time of the Entity (ISO Timestamp)
   */
  created: string;
  /**
   * Last modification time of the Entity (ISO Timestamp)
   */
  modified: string;
  /**
   * Unique label - not typically for display. For example, it might come from an external vocab with all caps: "TRIBE"
   * and the label to display to the user may be simply "Tribe"
   */
  label: string;
  /**
   * A unique slug, derived from the label
   */
  slug: string;

  /**
   * Readable labels for the Entity's Type.
   */
  title: InternationalString;
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

export interface EnrichmentEntityType extends EnrichmentEntityTypeSnippet {
  description: InternationalString;

  featured_topics?: EnrichmentEntitySnippet[];

  image_url: string;

  other_data: {
    example_data: string;
  };
}

export interface ResourceTagSnippet {
  url: string;
  id: string;
  entity: string;
  selector: [number, number];
}

export interface ResourceTag extends ResourceTagSnippet {
  url: string;
  id: string;
  entity: string;
  selector: [number, number];
  resource_id: string;
  resource_content_type_id: number;
  created: string;
  modified: string;
}

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
  other_data?: {
    main_image: {
      id?: string;
      alt: InternationalString;
      height?: string;
      width?: string;
      url: string;
    };
    thumbnail: {
      id?: string;
      alt: InternationalString;
      height?: string;
      width?: string;
      url: string;
    };
    topic_summary?: InternationalString;
    secondary_heading?: InternationalString;
  };
}

/**
 * Entity - List
 * Definition: https://github.com/digirati-co-uk/madoc-enrichment/blob/main/endpoint_docs.md#entity---list
 */
export interface EntityTypesMadocResponse {
  pagination: Pagination;
  results: EnrichmentEntityTypeSnippet[];
}

// Entity - List, filtered by chosen Entity Type
export interface EntitiesMadocResponse {
  pagination: Pagination;
  results: EnrichmentEntitySnippet[];
}

// Entity Type - Retrieve
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
  other_data?: any;
  featured_topics?: EnrichmentEntitySnippet[];
}

// Entity - Retrieve
export interface EntityMadocResponse {
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
  other_data?: {
    main_image: {
      id?: string;
      alt: InternationalString;
      height?: string;
      width?: string;
      url: string;
    };
    thumbnail: {
      id?: string;
      alt: InternationalString;
      height?: string;
      width?: string;
      url: string;
    };
    topic_summary?: InternationalString;
    secondary_heading?: InternationalString;
  };
}

export interface FeaturedResource {
  url: string;
  created: string;
  modified: string;
  type: string;
  madoc_id: string;
  label?: InternationalString;
  thumbnail?: string;
  metadata?: any; // ?
  other_data?: any; // ?
  count: number;
}
