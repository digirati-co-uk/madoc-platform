import { FormikCheckbox } from '../../atoms/FormikCheckbox';
import { Field } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledFormField, StyledFormInput, StyledFormLabel } from '../../atoms/StyledForm';

interface Props {
  optionsAsText?: string;
  previewList?: boolean;
}

function CheckboxListFieldEditor(props: Props) {
  const { t } = useTranslation();
  return (
    <>
      <StyledFormField>
        <StyledFormLabel>
          {t('Checkbox options (value,label one per line)')}
          <Field
            as={StyledFormInput}
            name="optionsAsText"
            multiline={true}
            defaultValue={props.optionsAsText}
            required={true}
          />
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          <FormikCheckbox name="previewList" required={false} />
          {t('Preview as list')}
        </StyledFormLabel>
      </StyledFormField>
    </>
  );
}

export default CheckboxListFieldEditor;
