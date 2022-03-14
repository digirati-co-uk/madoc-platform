import React, { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { BaseField } from '../../types/field-types';
import { FieldWrapper } from '../components/FieldWrapper/FieldWrapper';
import { Revisions } from '../stores/revisions';
import { useFieldSelector } from '../stores/selectors/selector-hooks';

export const FieldInstance: React.FC<{
  field: BaseField;
  property: string;
  path: Array<[string, string]>;
  hideHeader?: boolean;
  disabled?: boolean;
}> = ({ field, property, path, hideHeader, disabled }) => {
  const updateFieldValue = Revisions.useStoreActions(a => a.updateFieldValue);
  const updateSelectorValue = Revisions.useStoreActions(a => a.updateSelector);
  const chooseSelector = Revisions.useStoreActions(a => a.chooseSelector);
  const currentSelectorId = Revisions.useStoreState(s => s.selector.currentSelectorId);
  const clearSelector = Revisions.useStoreActions(a => a.clearSelector) as any;
  const previewData = Revisions.useStoreState(s => s.selector.selectorPreviewData);

  const selector = useFieldSelector(field);

  const [updateValue] = useDebouncedCallback(newValue => {
    updateFieldValue({ value: newValue, path: [...path, [property, field.id]] });
  }, 100);

  const updateSelector = useCallback(
    state => {
      if (field && field.selector) {
        updateSelectorValue({ selectorId: field.selector.id, state });
      }
    },
    [field, updateSelectorValue]
  );

  return (
    <FieldWrapper
      hideHeader={hideHeader}
      field={field}
      disabled={disabled}
      selector={selector}
      onUpdateValue={updateValue}
      onUpdateSelector={updateSelector}
      chooseSelector={chooseSelector}
      clearSelector={clearSelector as any}
      currentSelectorId={currentSelectorId}
      selectorPreview={selector ? previewData[selector.id] : undefined}
    />
  );
};
