import React, { useCallback } from 'react';
import { FieldHeader } from '../../editor/components/FieldHeader/FieldHeader';
import { Revisions } from '../../editor/stores/revisions/index';
import { useFieldSelector } from '../../editor/stores/selectors/selector-hooks';
import { useSelectorStatus } from '../../plugin-api/hooks/use-selector-status';
import { BaseField } from '../../types/field-types';

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
        required={field.required}
        labelFor={field.id}
        label={field.label}
        description={field.description}
        selectorComponent={selectorComponent}
        selectorId={field.selector?.id}
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
