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
  title: string;
  thumbnail: string;
  type: string;
  description: string;
  link: string;
};
