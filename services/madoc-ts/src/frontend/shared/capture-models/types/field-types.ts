import { FC as OriginalFC } from 'react';
import { BaseProperty } from './base-property';
import { CaptureModel } from './capture-model';
import { FieldTypeMap } from './custom';
import { MapValues } from './utility';

type FC<Props = {}> = OriginalFC<Props & { children?: React.ReactNode }>;

export interface BaseField extends BaseProperty {
  id: string;
  type: Exclude<string, 'entity'>;
  value: any;
}

export type FieldTypes<Type extends FieldTypeMap = FieldTypeMap> = MapValues<Type>;

export type InjectedFieldProps<ValueType> = {
  updateValue: (value: ValueType) => void;
};
// Injected properties.
export type FieldTypeProps<T extends { value: Value }, Value = T['value']> = T & InjectedFieldProps<T['value']>;
export type FieldSpecification<Props extends BaseField = BaseField> = {
  label: string;
  type: string;
  description: string;
  defaultValue: Props['value'];
  allowMultiple: boolean;
  maxMultiple?: number;
  required?: boolean;
  dependant?: string;
  defaultProps: Partial<Props>;
  Component: FC<Props & InjectedFieldProps<Props['value']>>;
  TextPreview: FC<Props>;
  Editor: FC<Required<Omit<Props, 'value' | 'selector'>> & Pick<Props, 'selector'>>;
  mapEditorProps?: (props: any) => any;
  onEditorSubmit?: (props: any) => any;
};

export type NestedField<Doc extends CaptureModel['document']> = Array<
  | { type: 'fields'; list: Array<BaseField> }
  | {
      type: 'documents';
      list: Array<
        CaptureModel['document'] & {
          fields: NestedField<CaptureModel['document']>;
        }
      >;
    }
>;
export type FieldComponent<T extends { value: Value }, Value = T['value']> = FC<FieldTypeProps<T, Value>>;
