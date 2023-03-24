import { Canvas, Collection, InternationalString, Manifest } from '@iiif/presentation-3';
import { Pagination } from './schemas/_pagination';

export type SearchResult = {
  /** Internal url for Search API - shouldn't be shown to the user, but can be used for unqiueness */
  url: string;

  /** Madoc identifier, usually in the form `urn:madoc:TYPE:ID` */
  resource_id: string;

  /** Type of resource (Collection, Manifest or Canvas etc.) */
  resource_type: string;

  /** Optional thumbnail of resource */
  madoc_thumbnail?: string;
  thumbnail?: string;

  /** Label for the resource from the search result */
  label: InternationalString;

  /** List of contexts for the resource */
  contexts:
    | Array<string>
    | Array<{
        type: string;
        id: string;
      }>;

  /**
   * List of hits.
   */
  hits: null | Array<SearchHit>;
};

/**
 * Represents a single search hit, there may be multiple of these per resource.
 */
export type SearchHit = {
  /** Type of metadata returned */
  type: string;
  /** Subtype of metadata returned */
  subtype: string;
  /** Preview of search result with highlighted search as HTML */
  snippet: string;
  /** ISO language string */
  language: string;
  /* Number to show rank of search result */
  rank: number;
  /** Bounding boxes */
  bounding_boxes?: Array<[number, number, number, number]>;
};

/**
 * Search response from Search API.
 */
export type SearchResponse = {
  /** List of search results */
  results: Array<SearchResult>;
  /** Standard pagination */
  pagination: Pagination;
  /** Map of facets, mapped to type then subtype. */
  facets: {
    [type: string]: {
      [subtype: string]: number;
    };
  };
};

/**
 * Query to send search API.
 */
export type SearchQuery = {
  /** Full text search query (can be phrase) */
  fulltext: string;

  /** ISO Language code to apply stemming rules */
  search_language?: string;

  /** Unknown search type */
  search_type?: 'phrase' | 'raw' | 'plain' | 'websearch';

  /** List of metadata fields to return facets for */
  facet_fields?: string[]; // @todo this is only filtering metadata at the moment.

  /** List of contexts to search within */
  contexts?: string[];

  /** Does not exist, but patched */
  iiif_type?: string;

  /** List of required contexts to search within */
  contexts_all?: string[];

  /** Unknown list of madoc identifiers to search within? */
  madoc_identifiers?: string[];

  /** Unknown list of identifiers to search within? */
  iiif_identifiers?: string[];

  /** Facet languages to be shown */
  facet_languages?: string[];

  /** List of values of facets to search for */
  facets?: Array<
    | {
        type: string;
        subtype: string;
        value: string;
      }
    | {
        type: string;
        subtype: string;
        value?: string;
        field_lookup?: string;
        indexable_int?: number;
        indexable_float?: number;
        indexable_date_range_start?: string;
        indexable_date_range_end?: string;
      }
    | {
        type: string;
        indexable_text: string;
      }
    // Unknown if this is supported.
    | {
        type: string;
        subtype: string;
        value: number;
        operator: 'exact' | 'lt' | 'gt' | 'lte' | 'gte';
      }
  >;

  raw?: { [field: string]: string };

  /** single madoc id to search within  */
  madoc_id?: string;

  /** If True, this signals to the API that non-Latin text (such as Chinese, Korean, Thai, etc) can be queried using fulltext (for example when the Postgres instance has support for zhparser or similar). This should largely be left un-set, as typically, this support will NOT be present. */
  non_latin_fulltext?: boolean;

  /** If True, this signals to the API that rather than parsing fulltext queries (using PostgreSQL `ts_query`) and matching against individual metadata fields, we should search across multiple fields for partial matches. Some support for stemming is lost, but more flexibility in matching is gained.   */
  search_multiple_fields?: boolean;
};

/** Post body for ingesting content into search */
export type SearchIngestRequest = {
  id: string;
  type: string;
  thumbnail: string;
  cascade?: boolean;
  cascade_canvases?: boolean;
  resource: Manifest | Canvas | Collection; // Raw IIIF resource if available.
  contexts: Array<{
    id: string;
    type: string;
  }>;
};
