import { Pagination } from '../../../types/schemas/_pagination';
import { InternationalString } from '@iiif/presentation-3';

export interface AuthoritySnippet {
  // id: string;
  uri: string;
  authority: string;
  identifier: string;
}

export interface Authority extends AuthoritySnippet {
  base_data_url: string;
  base_url: string;
}

export interface EnrichmentEntitySnippet {
  description: any;
  count: number;
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
  //todo change to type_title
  type_other_labels: InternationalString;

  /**
   * Readable title for the Entity.
   */
  title: InternationalString;

  /**
   * Unknown image url or list of urls.
   * @todo will change.
   */
  image_url: string | string[];
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
  //todo change to title
  other_labels: InternationalString;
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
  created: string;
  description: InternationalString;

  featured_topics?: EnrichmentEntitySnippet[];

  image_url: string;

  modified: string;

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
  type: SpaCyNERType | null;
  type_slug: string;
  //todo change to type_title
  type_other_labels: InternationalString;
  title: InternationalString;
  description: InternationalString;
  image_url: string;
  label: string;
  authorities: AuthoritySnippet[]; // Can't remember what this should be...
  other_data: {
    example_data: string;
  };
  featured_resources: FeaturedResource[];
  modified: string;
  created: string;
  topic_summary?: InternationalString;
  secondary_heading?: InternationalString;
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
  //todo change to title
  other_labels?: InternationalString;
  other_data?: any;
  image_url?: string;
  description?: InternationalString;
  featured_topics?: EnrichmentEntitySnippet[];
}

// Entity - Retrieve
export interface EntityMadocResponse {
  url: string;
  id: string;
  created: string;
  modified: string;

  type: string;
  type_slug: string;
  //todo change to type_title
  type_other_labels: InternationalString;

  label: string;
  slug: string;
  title: InternationalString;
  description: InternationalString;
  topic_summary?: InternationalString;
  image_url: string;
  image_caption: InternationalString;
  secondary_heading: string;
  authorities: AuthoritySnippet[];

  featured_resources: FeaturedResource[];
  related_topics: EnrichmentEntitySnippet[];
  other_data: any;
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
  count: number;
}
