import { FieldHeader, Revisions, useFieldSelector } from '@capture-models/editor';
import { useSelectorStatus } from '@capture-models/plugin-api';
import { BaseField } from '@capture-models/types';
import React, { useCallback } from 'react';

export const SegmentationFieldInstance: React.FC<{
  field: BaseField;
  property: string;
  path: Array<[string, string]>;
  hideHeader?: boolean;
}> = ({ field }) => {
  const updateSelectorValue = Revisions.useStoreActions(a => a.updateSelector);
  const chooseSelector = Revisions.useStoreActions(a => a.chooseSelector);
  const currentSelectorId = Revisions.useStoreState(s => s.selector.currentSelectorId);
  const clearSelector = Revisions.useStoreActions(a => a.clearSelector) as any;
  const previewData = Revisions.useStoreState(s => s.selector.selectorPreviewData);

  const selector = useFieldSelector(field);

  const updateSelector = useCallback(
    state => {
      if (field && field.selector) {
        updateSelectorValue({ selectorId: field.selector.id, state });
      }
    },
    [field, updateSelectorValue]
  );

  // From header
  const selectorComponent = useSelectorStatus(selector, {
    updateSelector,
    chooseSelector: (selectorId: string) => chooseSelector({ selectorId }),
    clearSelector,
    currentSelectorId: currentSelectorId ? currentSelectorId : undefined,
    selectorPreview: selector ? previewData[selector.id] : undefined,
  });

  if (!field.selector) {
    return null;
  }

  return (
    <>
      <FieldHeader
        labelFor={field.id}
        label={field.label}
        description={field.description}
        selectorComponent={selectorComponent}
        onSelectorOpen={() => {
          if (chooseSelector && selector) {
            chooseSelector({ selectorId: selector.id });
          }
        }}
        onSelectorClose={clearSelector}
      />
    </>
  );
};
