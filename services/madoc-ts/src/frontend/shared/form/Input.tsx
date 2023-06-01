import React, { useRef } from 'react';
import styled, { css } from 'styled-components';

export const InputLabel = styled.label<{ $caps?: boolean }>`
  margin-bottom: 0.5em;
  letter-spacing: -0.3px;
  font-weight: 500;
  line-height: 1.8em;

  ${props =>
    props.$caps &&
    css`
      text-transform: capitalize;
    `}
`;
export const InputSubLabel = styled.span`
  color: #424242;
  letter-spacing: -0.3px;
  font-weight: 400;
  line-height: 1.8em;
  font-size: 13px;
`;

export const inputStyles = css`
  background: #fff;
  border: none;
  padding: 0.5em 0 0.5em 0.7em;
  margin: 0.2em 0 0.2em 0.2em;
  border-radius: 0;
  font-size: 0.85em;
  line-height: 1.2em;
  border-right: 1px solid #ddd;
  font-family: inherit;
  resize: none;
  -webkit-appearance: none;
  tap-highlight-color: rgba(255, 255, 255, 0);

  &:focus {
    outline: none;
  }
`;

export const InputInner = styled.input`
  flex: 1 1 0px;
  ${inputStyles}
`;

export const InputInnerText = styled.div`
  line-height: 1.2em;
  padding: 0.5em 0 0.5em 0.7em;
`;

export const InputAsCard = styled.div`
  background: #fff;
  border: 2px solid rgba(5, 42, 68, 0.2);
  border-radius: 5px;
  padding: 0.7em 0.9em;
  margin-bottom: 1em;
  cursor: pointer;

  &:focus,
  &:hover {
    border-color: #5168d9;
  }
`;

export const CheckboxInput = styled.input.attrs({ type: 'checkbox' })``;

export const _Input = styled.input<{ $inactive?: boolean }>`
  background: #fff;
  border: 1px solid rgba(5, 42, 68, 0.2);
  padding: 0.7em 0.9em;
  font-size: 0.85em;
  line-height: 1.2em;
  border-radius: 3px;
  width: 100%;
  box-shadow: 0 0 0 0 transparent inset;
  &:focus {
    border-color: #333;
    outline: none;
  }
  display: block;
  margin: 0;
  outline: 0;
  font-family: inherit;
  -webkit-appearance: none;
  tap-highlight-color: rgba(255, 255, 255, 0);
  color: rgba(0, 0, 0, 0.87);

  &:focus {
    border-color: #5168d9;
    outline: none;
  }

  ${props =>
    props.$inactive &&
    css`
      background: #e6e6e6;
    `}
`;

export const Input: typeof _Input = React.forwardRef(function Input(props: any, ref: any) {
  return props.type === 'checkbox' ? (
    <CheckboxInput ref={ref} {...props} />
  ) : (
    ((<_Input ref={ref} {...props} />) as any)
  );
}) as any;

export const HighlightInput: typeof _Input = React.forwardRef(function HighlightInput(props: any, outerRef: any) {
  return (
    <Input
      ref={outerRef}
      onFocus={() => {
        if (outerRef.current) {
          outerRef.current.select();
        }
      }}
      {...props}
    />
  );
}) as any;

export const InputBorderless = styled.input`
  background: transparent;
  border: none;
  padding: 0.5em;
  font-size: 0.9em;
  line-height: 1.3em;
  width: 100%;
  box-shadow: none;
  border: none;
  &:focus {
    border-color: #333;
    outline: none;
  }
`;

export const InputContainer = styled.div<{ wide?: boolean; fluid?: boolean; $error?: boolean }>`
  display: flex;
  flex-direction: column;
  max-width: ${props => (props.fluid ? '100%' : props.wide ? '550px' : '360px')};
  margin-bottom: 1em;

  ${props =>
    props.$error &&
    css`
      background: #ffeaea;
      outline: 5px solid #ffeaea;

      input,
      textarea {
        border-color: #9c2824;
      }
    `}
`;

export const InputCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5em;

  label {
    flex: 1 1 0px;
    margin: 0;
    margin-left: 1em;
  }
`;

export const InputCheckboxInputContainer = styled.div<{ $checked?: boolean }>`
  background: #ddd;
  height: 2em;
  width: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ccc;
  ${props =>
    props.$checked &&
    css`
      background-color: #c5e8c5;
      border-color: #6ccd55;
    `}
`;

export const EmptyInputValue = styled.div<{ wide?: boolean }>`
  background: #eee;
  border: 1px solid rgba(5, 42, 68, 0.2);
  padding: 0.7em 0.9em;
  font-size: 0.85em;
  line-height: 1.3em;
  border-radius: 0;
  width: 100%;
  box-shadow: none;
  max-width: ${props => (props.wide ? '550px' : '450px')};
  margin-bottom: 0.8em;
  &:focus {
    border-color: #333;
    outline: none;
  }
`;

export const InputLink = styled.a`
  margin: 0.5em 0;
  font-size: 0.75em;
  color: #5071f4;
`;
