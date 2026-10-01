import { FormikCheckbox } from '../../atoms/FormikCheckbox';
import { Field } from 'formik';
import React from 'react';
import { StyledFormField, StyledFormInputElement, StyledFormLabel } from '../../atoms/StyledForm';

interface Props {
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  previewInline?: boolean;
  minLines?: number;
}

function TextFieldEditor(props: Props) {
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
          <FormikCheckbox name="multiline" required={false} />
          Allow multiline input
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          Minimum lines
          <Field
            as={StyledFormInputElement}
            type="number"
            name="minLines"
            defaultValue={props.minLines}
            required={false}
          />
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          <FormikCheckbox name="previewInline" required={false} />
          Preview text as inline (span)
        </StyledFormLabel>
      </StyledFormField>
    </>
  );
}

export default TextFieldEditor;
