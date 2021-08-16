import React, { useRef } from 'react';
import styled, { css } from 'styled-components';

export const InputLabel = styled.label`
  font-size: 0.9em;
  font-weight: bold;
  margin-bottom: 0.5em;
`;

export const Input = styled.input`
  background: #fff;
  border: 2px solid #999;
  padding: 0.5em;
  font-size: 0.9em;
  line-height: 1.3em;
  border-radius: 0;
  width: 100%;
  box-shadow: none;
  &:focus {
    border-color: #333;
    outline: none;
  }
`;

export const HighlightInput: typeof Input = ((props: any) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <Input
      ref={ref}
      onFocus={() => {
        if (ref.current) {
          ref.current.select();
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
  margin: 0.5em 0;

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
  border: 2px solid #999;
  padding: 0.55em;
  font-size: 0.9em;
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
