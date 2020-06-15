import { FieldWrapper, Revisions, useFieldSelector } from '@capture-models/editor';
import { BaseField } from '@capture-models/types';
import React from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const SingleFieldInstance: React.FC<{
  field: BaseField;
  path: Array<[string, string]>;
  hideHeader?: boolean;
}> = ({ field, path, hideHeader }) => {
  const updateFieldValue = Revisions.useStoreActions(a => a.updateFieldValue);
  const chooseSelector = Revisions.useStoreActions(a => a.chooseSelector);
  const currentSelectorId = Revisions.useStoreState(s => s.selector.currentSelectorId);
  const clearSelector = Revisions.useStoreActions(a => a.clearSelector) as any;
  const selector = useFieldSelector(field);

  const [updateValue] = useDebouncedCallback(newValue => {
    updateFieldValue({ value: newValue, path });
  }, 100);

  return (
    <FieldWrapper
      hideHeader={hideHeader}
      field={field}
      selector={selector}
      onUpdateValue={updateValue}
      chooseSelector={chooseSelector}
      clearSelector={clearSelector as any}
      currentSelectorId={currentSelectorId}
    />
  );
};
