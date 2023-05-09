import styled, { css } from 'styled-components';
import React, { forwardRef, useState } from 'react';
import { BrowserComponent } from '../../../utility/browser-component';
import { madocLazy } from '../../../utility/madoc-lazy';

const Textarea = madocLazy(() => /* webpackChunkName: "browser" */ import('react-textarea-autosize'));

export const StyledForm = styled.form`
  margin-bottom: 1em;
`;

export const StyledFormLabel = styled.label`
  font-weight: bold;
  font-size: 1em;
  line-height: 1.6em;
  display: block;
  > * {
    font-weight: normal;
  }
`;
export const StyledFormField = styled.div`
  display: block;
  margin-bottom: 1em;
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
  line-height: 1.2em;
  padding: 0.7em 0.9em;
  font-size: 1em;
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
  margin: 1em;
`;
export const StyledCheckbox: typeof _StyledCheckbox = forwardRef(function StyledCheckbox(props: any, ref) {
  return <_StyledCheckbox ref={ref} type="checkbox" {...props} />;
}) as any;

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
