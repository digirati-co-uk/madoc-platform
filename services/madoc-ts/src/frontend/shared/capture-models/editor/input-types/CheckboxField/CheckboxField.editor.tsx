import { Field } from 'formik';
import React from 'react';
import { StyledFormField, StyledFormInputElement, StyledFormLabel } from '../../atoms/StyledForm';

const CheckboxFieldEditor: React.FC<{ inlineLabel?: string }> = props => {
  return (
    <>
      <StyledFormField>
        <StyledFormLabel>
          Inline label
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
