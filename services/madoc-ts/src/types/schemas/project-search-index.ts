export interface ProjectSearchIndexFacet {
  path: string[];
  label: string;
}

export interface ProjectSearchIndexPreset {
  key: string;
  metadata: {
    label: string;
    summary?: string;
  };
  entityPath: string[];
  uniqueField?: string[];
  facets?: ProjectSearchIndexFacet[];
}

export interface ProjectSearchIndexDefinition {
  id: string;
  presetKey?: string;
  label: string;
  summary?: string;
  entityPath: string[];
  uniqueField?: string[];
  facets: ProjectSearchIndexFacet[];
  includeUnapproved: boolean;
  enabled: boolean;
  lastIndexedAt?: string;
  lastIndexedHash?: string;
  documentCount?: number;
  warnings?: string[];
}

export interface ProjectSearchIndexConfiguration {
  available: ProjectSearchIndexPreset[];
  indexes: ProjectSearchIndexDefinition[];
}

export interface ProjectSearchIndexRequest {
  presetKey?: string;
  label: string;
  summary?: string;
  entityPath: string[];
  uniqueField?: string[];
  facets?: ProjectSearchIndexFacet[];
  includeUnapproved?: boolean;
  enabled?: boolean;
}

export interface PublicProjectSearchIndex {
  id: string;
  label: string;
  summary?: string;
  facets: ProjectSearchIndexFacet[];
  collection: string;
}
