import { FieldSource } from '../../../frontend/shared/capture-models/editor/components/FieldEditor/FieldEditor';
import { BaseField } from '../../../frontend/shared/capture-models/types/field-types';
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
