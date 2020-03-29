export type Resource = {
  id: number;
  owner_id?: number;
  resource_class_id?: number;
  resource_template_id?: number;
  is_public: number;
  created: Date;
  modified?: Date;
  resource_type: string;
  thumbnail_id?: string;
};
