export type ModelSearch = {
  id: string;
  canvas: string;
  manifest: string | null;
  field_type: string;
  value: string;
  property?: string;
  capture_model_id: string;
  parent_property: string;
  selector?: any;
  selector_type?: string;
  context: string[];
};
