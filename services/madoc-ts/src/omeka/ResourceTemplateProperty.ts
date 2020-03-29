export type ResourceTemplateProperty = {
  id: number;
  resource_template_id: number;
  property_id: number;
  alternate_label?: string;
  alternate_comment?: string;
  position?: number;
  data_type?: string;
  is_required: number;
  is_private: number;
};
