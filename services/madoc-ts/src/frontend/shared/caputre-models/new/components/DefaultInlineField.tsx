import { useField } from '@capture-models/plugin-api';
import { BaseField } from '@capture-models/types';
import React, { useCallback, useState } from 'react';
import { FieldPreview, Revisions, RoundedCard } from '@capture-models/editor';
import { useDebouncedCallback } from 'use-debounce';
import { EditorRenderingConfig } from './EditorSlots';

export const DefaultInlineField: EditorRenderingConfig['InlineField'] = ({
  property,
  chooseField,
  path,
  readonly,
  field,
  canRemove,
  onRemove,
}) => {
  return (
    <RoundedCard
      key={field.id}
      size="small"
      interactive={!!chooseField}
      onClick={chooseField}
      onRemove={canRemove ? onRemove : undefined}
    >
      {readonly ? (
        <InlineReadonlyValue field={field} />
      ) : (
        <InlineInteractiveValue property={property} field={field} path={path as any} />
      )}
    </RoundedCard>
  );
};

export const InlineReadonlyValue: React.FC<{ field: BaseField }> = ({ field }) => {
  return <FieldPreview field={field} />;
};

export const InlineInteractiveValue: React.FC<{
  field: BaseField;
  property: string;
  path: Array<[string, string]>;
}> = ({ field, property, path }) => {
  const updateFieldValue = Revisions.useStoreActions(a => a.updateFieldValue);

  const [value, setValue] = useState(field.value);

  const [updateValueProps] = useDebouncedCallback(newValue => {
    updateFieldValue({ value: newValue, path: [...path, [property, field.id]] });
  }, 100);

  const updateValue = useCallback(
    newValue => {
      setValue(newValue);
      updateValueProps(newValue);
    },
    [updateValueProps]
  );

  return useField(field, value, updateValue);
};
