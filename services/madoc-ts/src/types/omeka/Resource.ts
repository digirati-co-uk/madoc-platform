export const ResourceItem = 'Omeka\\Entity\\Item';
export const ResourceItemSet = 'Omeka\\Entity\\ItemSet';
export const ResourceMedia = 'Omeka\\Entity\\Media';

export type Resource = {
  id: number;
  owner_id?: number;
  resource_class_id?: number;
  resource_template_id?: number;
  is_public: number;
  created: Date;
  modified?: Date;
  resource_type: 'Omeka\\Entity\\Item' | 'Omeka\\Entity\\ItemSet' | 'Omeka\\Entity\\Media';
  thumbnail_id?: string;
};
