import React from 'react';
import { BaseField, FieldComponent } from '../../../frontend/shared/capture-models/types/field-types';
import { InlineFieldContainer } from '../../../frontend/shared/capture-models/editor/atoms/InlineFieldContainer';
import { StyledCheckbox } from '../../../frontend/shared/capture-models/editor/atoms/StyledForm';
import { generateAvatar } from '../../../frontend/shared/utility/generate-avatar';
import { useUser } from '../../../frontend/shared/hooks/use-site';

export interface AvatarGeneratorFieldProps extends BaseField {
  type: 'avatar-generator-field';
  value: any | null;
  inlineLabel?: string;
  inlineDescription?: string;
  disabled?: boolean;
}

export const AvatarGenerator: FieldComponent<AvatarGeneratorFieldProps> = props => {
console.log(props.value)
  const user = useUser();

  const setAvatar = (v: boolean) => {
    return v ? generateAvatar(user?.name) : null;
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'start', gap: '1em' }}>
      <InlineFieldContainer data-inline>
        <StyledCheckbox
          name={props.id}
          id={props.id}
          checked={!!props.value}
          onChange={v => {
            props.updateValue(setAvatar(v.target.checked));
          }}
        />
      </InlineFieldContainer>
      {/*{`${props.value.svg}`}*/}
    </div>
  );
};
