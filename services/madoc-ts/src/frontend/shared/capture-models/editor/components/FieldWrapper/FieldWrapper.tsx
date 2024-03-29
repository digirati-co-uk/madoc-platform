import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserComponent } from '../../../../utility/browser-component';
import { useField } from '../../../plugin-api/hooks/use-field';
import { useSelectorStatus } from '../../../plugin-api/hooks/use-selector-status';
import { BaseField } from '../../../types/field-types';
import { BaseSelector } from '../../../types/selector-types';
import { FieldSection } from '../../atoms/StyledForm';
import { FieldHeader } from '../FieldHeader/FieldHeader';

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
  required?: boolean;
  dependant?: string;
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
  const { t } = useTranslation();
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
    <BrowserComponent fallback={typeof fallback !== 'undefined' ? fallback : t('loading...')}>
      <FieldSection>
        {hideHeader ? null : (
          <FieldHeader
            required={field.required}
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
      </FieldSection>
      {field.required || selector?.required ? <small>* {t('required')}</small> : null}
    </BrowserComponent>
  );
};
