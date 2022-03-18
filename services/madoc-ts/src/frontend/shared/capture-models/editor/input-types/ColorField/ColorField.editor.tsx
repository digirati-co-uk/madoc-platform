import { Field } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledCheckbox, StyledFormField, StyledFormInputElement, StyledFormLabel } from '../../atoms/StyledForm';

const ColorFieldEditor: React.FC<{
  inlineLabel?: string;
  clearable?: boolean;
}> = ({ clearable, inlineLabel }) => {
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
          <Field as={StyledCheckbox} type="checkbox" name="clearable" value={clearable} required={false} />
          {t('Allow clearing of selection')}
        </StyledFormLabel>
      </StyledFormField>
    </>
  );
};

export default ColorFieldEditor;
