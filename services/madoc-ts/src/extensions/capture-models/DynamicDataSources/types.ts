import { FieldSource } from '@capture-models/editor';
import { BaseField } from '@capture-models/types';
import { ApiClient } from '../../../gateway/api';

export type DynamicDataLoader = (
  field: BaseField,
  key: string,
  resource: { type: string; id: number },
  api: ApiClient
) => Promise<BaseField>;

export type DynamicData = {
  definition: FieldSource;
  loader: (field: BaseField, key: string, resource: { type: string; id: number }, api: ApiClient) => Promise<BaseField>;
};
