import { Pagination } from '../../../types/schemas/_pagination';

export interface AuthoritySnippet {
  name: string;
  url: string;
}

export interface Authority extends AuthoritySnippet {
  base_data_url: string;
  base_url: string;
}

export interface EnrichmentEntitySnippet {
  url: string;
  id: string;
  type: {
    url: string;
    id: string;
    label: string;
  };
  label: string;
}

export interface EnrichmentEntity {
  url: string;
  id: string;
  type: {
    url: string;
    id: string;
    label: string;
  };
  label: string;
  other_labels: OtherLabels;
  authorities: AuthoritySnippet[]; // Can't remember what this should be...
}

export interface EnrichmentEntityAuthority {
  url: string;
  id: string;
  authority: string;
  identifier: string;
}

export interface EnrichmentEntityTypeSnippet {
  url: string;
  id: string;
  label: string;
}

// @todo probably will change.
type OtherLabels = Array<{
  value: string;
  language: string;
}>;

export interface EnrichmentEntityType extends EnrichmentEntityTypeSnippet {
  created: string;
  modified: string;
  other_labels: OtherLabels;
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

export interface EntitySnippetMadoc {
  url: string;
  id: string;
  created: string;
  modified: string;
  type: string;
  label: string;
  other_labels: string[];
}

export interface EntityTypeMadocResponse {
  pagination: Pagination;
  results: EntitySnippetMadoc[];
}
