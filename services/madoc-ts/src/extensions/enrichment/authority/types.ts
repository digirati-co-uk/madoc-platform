import { Pagination } from '../../../types/schemas/_pagination';
import { InternationalString } from '@iiif/presentation-3';

export interface AuthoritySnippet {
  id: string;
  url: string;
  authority: string;
  identifier: string;
}

export interface Authority extends AuthoritySnippet {
  base_data_url: string;
  base_url: string;
}

export interface EnrichmentEntitySnippet {
  url: string;
  id: string;
  created: string;
  modified: string;
  type: string;
  label: string;
  slug: string;
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
  created: string;
  modified: string;
  label: string;
  slug: string;
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

export interface EnrichmentEntity {
  url: string;
  id: string;
  type: {
    url: string;
    id: string;
    label: string;
  };
  description: { value: string; language: string }[];
  image_url: string;
  label: string;
  other_labels: OtherLabels;
  authorities: AuthoritySnippet[]; // Can't remember what this should be...
  other_data: {
    image_url: string;
    image_caption?: string;
  };

  modified: string;
  created: string;
}

export interface EntitySnippetMadoc {
  url: string;
  id: string;
  created: string;
  modified: string;
  type: string;
  label: string;
  slug: string;
}

// list of entity types
export interface EntityTypesMadocResponse {
  pagination: Pagination;
  results: EnrichmentEntityTypeSnippet[];
}

// Entity - List, filtered by chosen Entity Type
export interface EntitiesMadocResponse {
  pagination: Pagination;
  results: EntitySnippetMadoc[];
}

// Entity Type - Retrieve
export interface EntityTypeMadocResponse {
  url: string;
  id: string;
  created: string;
  modified: string;
  label: string;
  slug: string;
  other_labels?: OtherLabels;
  other_data?: OtherLabels;
  image_url?: string;
  description?: InternationalString;
}

// Entity - Retrieve
export interface EntityMadocResponse {
  url: string;
  id: string;
  created: string;
  modified: string;
  type: string;
  label: string;
  slug: string;
  title: InternationalString;
  description: InternationalString;
  topic_summary?: string;
  image_url: string;
  image_caption: string;
  secondary_heading: string;
  authorities: { authority: string; identifier: string; uri: string }[];
}
