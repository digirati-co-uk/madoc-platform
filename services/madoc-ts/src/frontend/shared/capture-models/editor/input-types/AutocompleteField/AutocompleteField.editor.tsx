import { Field } from 'formik';
import React from 'react';
import {
  StyledFormField,
  StyledFormLabel,
  StyledFormInputElement,
  StyledCheckbox,
  StyledFormInput,
} from '../../atoms/StyledForm';
import { useTranslation } from 'react-i18next';

type Props = {
  dataSource: string;
  placeholder?: string;
  clearable: boolean;
  requestInitial: boolean;
};

const AutocompleteFieldEditor: React.FC<Props> = props => {
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
          <Field
            as={StyledFormInputElement}
            type="text"
            name="placeholder"
            value={props.placeholder}
            required={false}
          />
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          <Field as={StyledCheckbox} type="checkbox" name="clearable" value={props.clearable} required={false} />
          {t('Allow clearing of selection')}
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          <Field
            as={StyledCheckbox}
            type="checkbox"
            name="requestInitial"
            value={props.requestInitial}
            required={false}
          />
          {t('Make initial search')}
        </StyledFormLabel>
      </StyledFormField>
    </>
  );
};

export default AutocompleteFieldEditor;
