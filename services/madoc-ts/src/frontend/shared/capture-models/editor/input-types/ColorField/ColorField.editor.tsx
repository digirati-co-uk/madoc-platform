import { Field } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledCheckbox, StyledFormField, StyledFormLabel } from '../../atoms/StyledForm';
import { ColorFieldProps } from './ColorField';

const ColorFieldEditor: React.FC<ColorFieldProps> = ({ clearable }) => {
  const { t } = useTranslation();
  return (
    <>
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
