import * as React from 'react';
import { CaptureModel } from '../../../types/capture-model';
import { BaseField, NestedField } from '../../../types/field-types';
import { Heading } from '../Heading/Heading';

export type FieldSetRenderField = (
  field: BaseField,
  config: {
    path: Array<[string, number]>;
    depth: number;
    key: number;
    count: number;
  }
) => React.ReactElement | null;

export type FieldSetRenderFieldset = (
  props: FieldSetProps,
  config: { key: number; count: number }
) => React.ReactElement | null;

export type FieldSetProps = {
  label?: string;
  description?: string;
  fields: NestedField<CaptureModel['document']>;
  renderField: FieldSetRenderField;
  renderNestedFieldset?: FieldSetRenderFieldset;
  path?: Array<[string, number]>;
  depth?: number;
} & React.DetailedHTMLProps<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;

export const FieldSet: React.FC<FieldSetProps> = ({
  label,
  description,
  fields,
  renderField,
  renderNestedFieldset,
  depth = 0,
  path = [],
  ...props
}) => (
  <fieldset {...props}>
    {label && (
      <Heading size={(['large', 'medium', 'small'][depth] || 'small') as 'large' | 'medium' | 'small'}>{label}</Heading>
    )}
    {description && <p>{description}</p>}
    {fields.map((field, fieldKey) => (
      <React.Fragment key={fieldKey}>
        {field.type === 'documents'
          ? field.list.map((doc, key) =>
              renderNestedFieldset ? (
                renderNestedFieldset(
                  {
                    label: doc.label,
                    description: doc.description,
                    fields: doc.fields,
                    renderField,
                    renderNestedFieldset,
                    depth: depth + 1,
                    path: [...path, [doc.id, key]],
                  },
                  { key, count: field.list.length }
                )
              ) : (
                <FieldSet
                  {...props}
                  key={key}
                  label={doc.label}
                  description={doc.description}
                  depth={depth + 1}
                  fields={doc.fields}
                  renderField={renderField}
                />
              )
            )
          : field.list.map((nestedField, key) =>
              renderField(nestedField, {
                depth: depth + 1,
                key,
                path: [...path, [nestedField.id, key]],
                count: field.list.length,
              })
            )}
      </React.Fragment>
    ))}
  </fieldset>
);
