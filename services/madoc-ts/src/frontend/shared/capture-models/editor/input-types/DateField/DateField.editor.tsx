import { Field } from 'formik';
import React from 'react';
import { StyledCheckbox, StyledFormField, StyledFormInputElement, StyledFormLabel } from '../../atoms/StyledForm';

type Props = {
  placeholder?: string;
  required?: boolean;
};

const DateFieldEditor: React.FC<Props> = props => {
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
          <Field as={StyledCheckbox} type="checkbox" name="required" defaultValue={props.required} required={false} />
          Required
        </StyledFormLabel>
      </StyledFormField>
    </>
  );
};

export default DateFieldEditor;
