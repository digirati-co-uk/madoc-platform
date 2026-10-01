import { FormikCheckbox } from '../../atoms/FormikCheckbox';
import { Field } from 'formik';
import React from 'react';
import { StyledFormField, StyledFormLabel, StyledFormInputElement, StyledFormInput } from '../../atoms/StyledForm';
import { useTranslation } from 'react-i18next';

interface Props {
  dataSource: string;
  placeholder?: string;
  clearable: boolean;
  requestInitial: boolean;
}

function AutocompleteFieldEditor(props: Props) {
  const { t } = useTranslation();
  return (
    <>
      <StyledFormField>
        <StyledFormLabel>
          {t('Data source')}
          <Field as={StyledFormInput} type="text" name="dataSource" value={props.dataSource} required={true} />
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          {t('Placeholder')}
          <Field as={StyledFormInputElement} type="text" name="placeholder" required={false} />
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          <FormikCheckbox name="clearable" required={false} />
          {t('Allow clearing of selection')}
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          <FormikCheckbox name="requestInitial" required={false} />
          {t('Make initial search')}
        </StyledFormLabel>
      </StyledFormField>
    </>
  );
}

export default AutocompleteFieldEditor;
