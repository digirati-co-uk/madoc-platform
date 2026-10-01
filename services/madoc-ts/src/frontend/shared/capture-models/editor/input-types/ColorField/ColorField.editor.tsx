import { FormikCheckbox } from '../../atoms/FormikCheckbox';
import { Field } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledFormField, StyledFormInputElement, StyledFormLabel } from '../../atoms/StyledForm';

interface Props {
  inlineLabel?: string;
  clearable?: boolean;
}

function ColorFieldEditor({ inlineLabel }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <StyledFormField>
        <StyledFormLabel>
          {t('Inline label')}
          <Field
            as={StyledFormInputElement}
            type="text"
            name="inlineLabel"
            defaultValue={inlineLabel}
            required={false}
          />
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          <FormikCheckbox name="clearable" required={false} />
          {t('Allow clearing of selection')}
        </StyledFormLabel>
      </StyledFormField>
    </>
  );
}

export default ColorFieldEditor;
