import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import { BaseField } from '../../../types/field-types';
import { Button } from '../../atoms/Button';
import { FieldWrapper } from '../FieldWrapper/FieldWrapper';
import { useTranslation } from 'react-i18next';
import { getGuidedValueIssue } from '../../../../utility/guided-formats';
import type { TextFieldProps } from '../../input-types/TextField/TextField';

interface FormPreviewProps {
  term?: string;
  type: string;
  defaultValue?: unknown;
  setDefaultValue?: (value: unknown) => void;
  mapValues?: (props: BaseField) => BaseField;
}

export function FormPreview({ type, term, mapValues, defaultValue, setDefaultValue }: FormPreviewProps) {
  const { t } = useTranslation();
  const { values } = useFormikContext<BaseField>();
  const [value, setValue] = useState<unknown>(values.value);
  const displayValues = { ...values, required: false };
  const defaultIssue =
    type === 'text-field' && typeof value === 'string'
      ? getGuidedValueIssue(value, values as TextFieldProps)
      : undefined;

  return (
    <>
      <div
        onKeyDown={event => {
          if (event.key === 'Enter' && event.target instanceof HTMLInputElement) event.preventDefault();
        }}
      >
        <FieldWrapper
          field={{ ...(mapValues ? mapValues(displayValues) : displayValues), value, type }}
          term={term}
          onUpdateValue={setValue}
        />
      </div>
      {setDefaultValue && value !== defaultValue ? (
        <>
          <Button
            type="button"
            disabled={!!defaultIssue}
            onClick={() => {
              if (!defaultIssue) setDefaultValue(value);
            }}
            size="mini"
          >
            {t('Use as default value')}
          </Button>
          {defaultIssue ? (
            <p className="text-xs text-gray-600">{t('Complete the example before using it as a default value.')}</p>
          ) : null}
        </>
      ) : null}
    </>
  );
}
