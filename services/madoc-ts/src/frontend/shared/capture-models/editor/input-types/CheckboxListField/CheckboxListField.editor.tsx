import { Field } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledCheckbox, StyledFormField, StyledFormInput, StyledFormLabel } from '../../atoms/StyledForm';

const CheckboxListFieldEditor: React.FC<{ optionsAsText?: string; previewList?: boolean }> = props => {
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
          <Field as={StyledCheckbox} type="checkbox" name="clearable" value={props.previewList} required={false} />
          {t('Preview as list')}
        </StyledFormLabel>
      </StyledFormField>
    </>
  );
};

export default CheckboxListFieldEditor;
