import styled, { css } from 'styled-components';
import React, { forwardRef, useState } from 'react';
import { BrowserComponent } from '../../../utility/browser-component';
import { madocLazy } from '../../../utility/madoc-lazy';

const Textarea = madocLazy(() => /* webpackChunkName: "browser" */ import('react-textarea-autosize'));

export const StyledForm = styled.form`
  margin-bottom: 1rem;
`;

const textSize = `0.875rem`;
const lineHeight = `1.5rem`;

export const StyledFormLabel = styled.label`
  font-weight: bold;
  font-size: ${textSize};
  line-height: ${lineHeight};
  display: block;
  > * {
    font-weight: normal;
  }
`;
export const StyledFormField = styled.div`
  display: block;
  margin-bottom: 1rem;
`;

export const FieldSection = styled.div`
  margin-bottom: 1.25rem;
`;

export const inputCss = css`
  display: block;
  width: 100%;
  margin: 0;
  outline: 0;
  font-family: inherit;
  -webkit-appearance: none;
  border-radius: 3px;
  tap-highlight-color: rgba(255, 255, 255, 0);
  padding: 0.4rem 0.8rem;
  font-size: ${textSize};
  line-height: ${lineHeight};
  background: #fff;
  border: 1px solid rgba(5, 42, 68, 0.2);
  color: rgba(0, 0, 0, 0.87);
  box-shadow: 0 0 0 0 transparent inset;

  &:focus {
    border-color: #005cc5;
  }

  &:disabled {
    background: #f0f0f0;
    cursor: not-allowed;
  }

  //&:not(:valid)&:not(:focus) {
  //  border: 1px solid #de1010;
  //}
`;

const _StyledCheckbox = styled.input`
  margin: 0.8rem;
  width: 1rem;
  height: 1rem;
  grid-area: checkbox;
  align-self: flex-start;
`;
export const StyledCheckbox: typeof _StyledCheckbox = forwardRef(function StyledCheckbox(props: any, ref) {
  return <_StyledCheckbox ref={ref} type="checkbox" {...props} />;
}) as any;

export const StyledCheckboxLabel = styled.div`
  grid-area: label;
  align-self: center;
  font-weight: 500;
  margin: 0.35rem 0;
`;
export const StyledCheckboxDescription = styled.div`
  font-size: 0.875rem;
  line-height: 1.3rem;
  color: #666;
  grid-area: description;
  margin-bottom: 0.5rem;
`;

export const StyledCheckboxContainer = styled.label`
  display: grid;
  grid-template-columns: 3rem 1fr;
  padding: 0 0.25rem;
  grid-template-areas:
    'checkbox label'
    'checkbox description';

  &:first-child {
    border-radius: 3px 3px 0 0;
  }

  &:last-child {
    border-radius: 0 0 3px 3px;
  }

  &:first-child:last-child {
    border-radius: 3px;
  }

  &[data-no-description='true'] {
    grid-template-rows: 1fr;
  }

  &:focus-within {
    background: #f1f8ff;
    margin-left: 0px;
  }
`;

const _StyledColor = styled.input`
  //margin: 0.5em;
`;
export const StyledColor: typeof _StyledColor = forwardRef(function StyledColor(props: any, ref) {
  return <_StyledColor ref={ref} type="color" {...props} />;
}) as any;

export const StyledFormInputElement = styled.input`
  ${inputCss}
`;

export const StyledFormMultilineInputElement = styled(Textarea)`
  ${inputCss}
`;

export const StyledFormInput: React.FC<React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & { multiline?: boolean }> = forwardRef<any>(function StyledFormInput({ multiline, ...props }: any, ref) {
  const [value, setValue] = useState<string>(props.value as string);

  if (multiline) {
    return (
      <BrowserComponent fallback={null}>
        <StyledFormMultilineInputElement
          ref={ref}
          {...(props as any)}
          value={value}
          onChange={e => {
            setValue(e.currentTarget.value);
            if (props.onChange) {
              props.onChange(e as any);
            }
          }}
        />
      </BrowserComponent>
    );
  }

  return (
    <StyledFormInputElement
      ref={ref}
      {...(props as any)}
      value={value}
      onChange={e => {
        setValue(e.currentTarget.value);
        if (props.onChange) {
          props.onChange(e);
        }
      }}
    />
  );
}) as any;

export const StyledFormTextarea = styled.textarea`
  ${inputCss}
`;
