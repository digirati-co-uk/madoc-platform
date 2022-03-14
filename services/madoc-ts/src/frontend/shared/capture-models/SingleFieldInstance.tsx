import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { FieldWrapper } from './editor/components/FieldWrapper/FieldWrapper';
import { Revisions } from './editor/stores/revisions/index';
import { useFieldSelector } from './editor/stores/selectors/selector-hooks';
import { BaseField } from './types/field-types';

export const SingleFieldInstance: React.FC<{
  field: BaseField;
  path: Array<[string, string]>;
  hideHeader?: boolean;
}> = ({ field, path, hideHeader }) => {
  const updateFieldValue = Revisions.useStoreActions(a => a.updateFieldValue);
  const chooseSelector = Revisions.useStoreActions(a => a.chooseSelector);
  const currentSelectorId = Revisions.useStoreState(s => s.selector.currentSelectorId);
  const clearSelector = Revisions.useStoreActions(a => a.clearSelector) as any;
  const previewData = Revisions.useStoreState(s => s.selector.selectorPreviewData);

  const selector = useFieldSelector(field);

  const [updateValue] = useDebouncedCallback(newValue => {
    updateFieldValue({ value: newValue, path });
  }, 100);

  return (
    <FieldWrapper
      key={field.id}
      hideHeader={hideHeader}
      field={field}
      selector={selector}
      onUpdateValue={updateValue}
      chooseSelector={chooseSelector}
      clearSelector={clearSelector as any}
      currentSelectorId={currentSelectorId}
      selectorPreview={selector ? previewData[selector.id] : undefined}
    />
  );
};
