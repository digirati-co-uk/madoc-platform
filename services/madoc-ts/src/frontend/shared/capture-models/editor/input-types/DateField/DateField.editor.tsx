import { FormikCheckbox } from '../../atoms/FormikCheckbox';
import { Field } from 'formik';
import React from 'react';
import { StyledFormField, StyledFormInputElement, StyledFormLabel } from '../../atoms/StyledForm';

interface Props {
  placeholder?: string;
  required?: boolean;
}

function DateFieldEditor(props: Props) {
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
          <FormikCheckbox name="required" required={false} />
          Required
        </StyledFormLabel>
      </StyledFormField>
    </>
  );
}

export default DateFieldEditor;
