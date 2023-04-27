export interface SearchContext {
  created: string;
  id: string;
  modified: string;
  urn: string;
}

export interface ResourceRelationship {
  id: string;
  created: string;
  modified: string;
  source_id: string;
  source_content_type: number;
  type: string;
  target_id: string;
  target_content_type: number;
}
