import { useField } from '@capture-models/plugin-api';
import { BaseField } from '@capture-models/types';
import React, { useCallback, useState } from 'react';
import { FieldPreview, Revisions, RoundedCard } from '@capture-models/editor';
import { useDebouncedCallback } from 'use-debounce';
import { ModifiedStatus } from '../features/ModifiedStatus';
import { useFieldDetails } from '../hooks/use-field-details';
import { EditorRenderingConfig, useProfile, useProfileOverride } from './EditorSlots';

export const DefaultInlineField: EditorRenderingConfig['InlineField'] = props => {
  const { property, chooseField, path, readonly, field, canRemove, onRemove } = props;
  const { isModified } = useFieldDetails(field);
  const profile = useProfile();
  const ProfileSpecificComponent = useProfileOverride('InlineField');

  if (ProfileSpecificComponent) {
    return <ProfileSpecificComponent {...props} />;
  }

  return (
    <RoundedCard
      size="small"
      interactive={!!chooseField}
      onClick={chooseField}
      onRemove={canRemove ? onRemove : undefined}
    >
      {isModified && <ModifiedStatus />}
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
