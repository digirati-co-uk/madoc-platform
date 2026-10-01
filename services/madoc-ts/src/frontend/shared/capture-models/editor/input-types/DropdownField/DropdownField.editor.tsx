import { FormikCheckbox } from '../../atoms/FormikCheckbox';
import { Field } from 'formik';
import React from 'react';
import { StyledFormField, StyledFormLabel, StyledFormInput, StyledFormInputElement } from '../../atoms/StyledForm';

interface Props {
  allowedTags?: string[];
  enableHistory?: boolean;
  enableExternalImages?: boolean;
  enableLinks?: boolean;
  placeholder?: string;
  inline?: boolean;
  optionsAsText: string;
  clearable: boolean;
}

function DropdownFieldEditor(props: Props) {
  return (
    <>
      <StyledFormField>
        <StyledFormLabel>
          Placeholder
          <Field
            as={StyledFormInputElement}
            type="text"
            name="placeholder"
            defaultValue={props.placeholder}
            required={false}
          />
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          Dropdown options (value,label one per line)
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
          <FormikCheckbox name="clearable" required={false} />
          Allow clearing of selection
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          <FormikCheckbox name="inline" required={false} />
          Use inline variant
        </StyledFormLabel>
      </StyledFormField>
    </>
  );
}

export default DropdownFieldEditor;
