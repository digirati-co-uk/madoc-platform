export type ValueTypes = 'resource' | 'literal' | 'uri' | 'resource:item';

export type Value = {
  id: number;
  resource_id: number;
  property_id: number;
  value_resource_id?: number;
  type: ValueTypes;
  lang?: string;
  value?: string;
  uri?: string;
  is_public: number;
};
