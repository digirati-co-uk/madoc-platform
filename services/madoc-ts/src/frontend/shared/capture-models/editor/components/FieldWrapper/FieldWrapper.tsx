import React, { useCallback, useEffect, useState } from 'react';
import { useField } from '../../../plugin-api/hooks/use-field';
import { useSelectorStatus } from '../../../plugin-api/hooks/use-selector-status';
import { BaseField } from '../../../types/field-types';
import { BaseSelector } from '../../../types/selector-types';
import { FieldHeader } from '../FieldHeader/FieldHeader';
import { FieldSet } from '../../../../form/FieldSet';

type Props<T extends BaseField = BaseField> = {
  field: T;
  selector?: BaseSelector;
  term?: string;
  showTerm?: boolean;
  onUpdateValue: (value: T['value']) => void;
  hideHeader?: boolean;
  fallback?: any;
  chooseSelector?: (payload: { selectorId: string }) => void;
  currentSelectorId?: string | null;
  onUpdateSelector?: (state: any) => void;
  clearSelector?: () => void;
  selectorPreview?: any;
  disabled?: boolean;
  selectorLabel?: string;

  // @todo other things for the selector.
  // onChooseSelector()
  // onClearSelector()
  // onUpdateSelector()
  // onDisplaySelector()
  // onHideSelector()
};

export const FieldWrapper: React.FC<Props> = ({
  field,
  term,
  onUpdateValue,
  showTerm,
  selector,
  hideHeader,
  fallback,
  chooseSelector,
  currentSelectorId,
  clearSelector,
  selectorPreview,
  onUpdateSelector,
  selectorLabel,
  disabled,
}) => {
  const [value, setValue] = useState(field.value);

  const updateValue = useCallback(
    newValue => {
      setValue(newValue);
      onUpdateValue(newValue);
    },
    [onUpdateValue]
  );

  const fieldComponent = useField(field, value, updateValue, { disabled });

  // @todo pass a lot of (optional) things from props to this selector status for actions on selectors.
  const selectorComponent = useSelectorStatus(selector, {
    updateSelector: onUpdateSelector,
    chooseSelector: chooseSelector ? (selectorId: string) => chooseSelector({ selectorId }) : undefined,
    clearSelector,
    currentSelectorId: currentSelectorId ? currentSelectorId : undefined,
    selectorPreview,
  });

  const componentWillUnmount = useCallback(() => {
    if (selector && clearSelector && currentSelectorId === selector.id) {
      clearSelector();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSelectorId]);

  // On unmount.
  useEffect(() => componentWillUnmount, [componentWillUnmount]);

  return (
    <React.Suspense fallback={typeof fallback !== 'undefined' ? fallback : 'loading...'}>
      <div style={{ marginBottom: '1em' }}>
        {hideHeader ? null : (
          <FieldHeader
            selectorLabel={selectorLabel}
            labelFor={field.id}
            label={field.label}
            description={field.description}
            selectorComponent={selectorComponent}
            selectorId={field.selector?.id}
            showTerm={showTerm}
            onSelectorOpen={() => {
              if (chooseSelector && selector) {
                chooseSelector({ selectorId: selector.id });
              }
            }}
            onSelectorClose={clearSelector}
            term={term}
          />
        )}
        {fieldComponent || ''}
      </div>
    </React.Suspense>
  );
};
