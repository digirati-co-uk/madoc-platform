export interface TermConfigurationRow {
  id: string;
  url_pattern: string;
  results_path: string;
  label_path: string;
  uri_path: string;
  resource_class_path: string | null;
  description_path: string | null;
  language_path: string | null;
  term_label: string;
  term_description: string | null;
  attribution: string | null;
  site_id: number;
  creator: number;
  created_at: string;
}

export interface TermConfigurationRowUserJoin extends TermConfigurationRow {
  creator_name: string;
}

export interface TermConfiguration {
  id: string;
  url_pattern: string;
  paths: {
    results: string;
    label: string;
    uri: string;
    resource_class: string | null;
    description: string | null;
    language: string | null;
  };
  label: string;
  description: string | null;
  attribution: string | null;
  creator: {
    id: number;
    name?: string;
  };
  created_at: Date;
}

export type TermConfigurationRequest = Omit<TermConfiguration, 'id' | 'created_at' | 'creator'>;
