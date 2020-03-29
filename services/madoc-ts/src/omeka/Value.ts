export type Value = {
  id: number;
  resource_id: number;
  property_id: number;
  value_resource_id?: number;
  type: string;
  lang?: string;
  value?: string;
  uri?: string;
  is_public: number;
};
