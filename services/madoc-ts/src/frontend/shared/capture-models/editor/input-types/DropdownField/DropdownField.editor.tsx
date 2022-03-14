import { Field } from 'formik';
import React from 'react';
import {
  StyledFormField,
  StyledFormLabel,
  StyledFormInput,
  StyledFormInputElement,
  StyledCheckbox,
} from '../../atoms/StyledForm';

type Props = {
  allowedTags?: string[];
  enableHistory?: boolean;
  enableExternalImages?: boolean;
  enableLinks?: boolean;
  placeholder?: string;
  optionsAsText: string;
  clearable: boolean;
};

const DropdownFieldEditor: React.FC<Props> = props => {
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
          <Field as={StyledCheckbox} type="checkbox" name="clearable" defaultValue={props.clearable} required={false} />
          Allow clearing of selection
        </StyledFormLabel>
      </StyledFormField>
    </>
  );
};

export default DropdownFieldEditor;
