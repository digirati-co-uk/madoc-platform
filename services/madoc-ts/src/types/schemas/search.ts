import { Pagination } from './_pagination';
import { InternationalString } from '@hyperion-framework/types';

export type ModelSearch = {
  id: string;
  canvas: string;
  manifest: string | null;
  field_type: string;
  value: string;
  property?: string;
  capture_model_id: string;
  parent_property: string;
  parent_label: string;
  selector?: any;
  selector_type?: string;
  parent_selector?: any;
  parent_selector_type?: string;
  context: string[];
};

// This needs to be refined
export type SearchResult = {
  id: string;
  label: any;
  madoc_thumbnail: string;
  hits: any;
  resource_id: string;
  type: string;
  snippet: string;
  url: string;
};

type FacetOption = {
  value: string;
  text: string;
};
// This also needs to be refined
export type SearchFacet = {
  name: string;
  options: Array<FacetOption>;
};

export type SearchResponse = {
  results: Array<{
    url: string;
    resource_id: string;
    resource_type: string;
    madoc_thumbnail: string;
    id: string;
    label: InternationalString;
    context: Array<{
      url: string;
      id: string;
      type: string;
    }>;
    hits: Array<{
      type: string;
      subtype: string;
      snippet: string;
      language: string;
      rank: number;
      original_content: string;
    }>;
  }>;
  pagination: Pagination;
  facets: any;
};
