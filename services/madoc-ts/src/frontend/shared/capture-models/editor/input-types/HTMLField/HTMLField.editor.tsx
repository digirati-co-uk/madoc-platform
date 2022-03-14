import { Field } from 'formik';
import React from 'react';
import { StyledCheckbox, StyledFormField, StyledFormLabel } from '../../atoms/StyledForm';

type Props = {
  allowedTags?: string[];
  enableHistory?: boolean;
  enableExternalImages?: boolean;
  enableLinks?: boolean;
  enableStylesDropdown?: boolean;
};

const HTMLFieldEditor: React.FC<Props> = props => {
  if (true as boolean) {
    return null;
  }
  return (
    <>
      <StyledFormField>
        <StyledFormLabel>
          <Field
            as={StyledCheckbox}
            type="checkbox"
            name="enableHistory"
            defaultValue={props.enableHistory}
            required={false}
          />
          Enable history (undo/redo)
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          <Field
            as={StyledCheckbox}
            type="checkbox"
            name="enableExternalImages"
            defaultValue={props.enableExternalImages}
            required={false}
          />
          Allow external images
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          <Field
            as={StyledCheckbox}
            type="checkbox"
            name="enableLinks"
            defaultValue={props.enableLinks}
            required={false}
          />
          Enable links
        </StyledFormLabel>
      </StyledFormField>
      <StyledFormField>
        <StyledFormLabel>
          <Field
            as={StyledCheckbox}
            type="checkbox"
            name="enableStylesDropdown"
            defaultValue={props.enableStylesDropdown}
            required={false}
          />
          Enable preset styles dropdown
        </StyledFormLabel>
      </StyledFormField>
    </>
  );
};

export default HTMLFieldEditor;
