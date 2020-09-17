import { Canvas, Collection, InternationalString, Manifest } from '@hyperion-framework/types';
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

  /** Label for the resource from the search result */
  label: InternationalString;

  /** List of contexts for the resource */
  contexts: Array<{
    type: string;
    id: string;
  }>;

  /**
   * List of hits.
   */
  hits: Array<SearchHit>;
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
  search_type?: 'websearch';

  /** List of metadata fields to return facets for */
  facet_fields?: string[]; // @todo this is only filtering metadata at the moment.

  /** List of contexts to search within */
  contexts?: string[];

  /** Unknown list of madoc identifiers to search within? */
  madoc_identifiers?: string[];
  /** Unknown list of identifiers to search within? */
  iiif_identifiers?: string[];

  /** List of values of facets to search for */
  facets?: SearchFacet[];
};

/**
 * Search facet configuration for query.
 */
export type SearchFacet = {
  type: string;
  subtype: string;
  value: string;
};

/** Post body for ingesting content into search */
export type SearchIngestRequest = {
  id: string;
  thumbnail: string;
  resource: Manifest | Canvas | Collection; // Raw IIIF resource if available.
  contexts: Array<{
    id: string;
    type: string;
  }>;
};
