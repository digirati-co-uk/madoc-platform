import { Field } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledFormField, StyledFormInputElement, StyledFormLabel } from '../../atoms/StyledForm';

const CheckboxFieldEditor: React.FC<{ inlineLabel?: string }> = props => {
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
            defaultValue={props.inlineLabel}
            required={false}
          />
        </StyledFormLabel>
      </StyledFormField>
    </>
  );
};

export default CheckboxFieldEditor;
