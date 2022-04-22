import styled, { css } from 'styled-components';

const Container = styled.div`
  background: #f6f6f6;
  border-radius: 3px;
  overflow: hidden;
  display: flex;
  align-items: center;
  min-height: 2.75em;
`;

const inputReset = css`
  box-shadow: 0 0 0 0 transparent inset;
  margin: 0;
  outline: 0;
  font-family: inherit;
  -webkit-appearance: none;
  tap-highlight-color: rgba(255, 255, 255, 0);
`;

const boxStyles = css`
  background: #fff;
  color: rgba(0, 0, 0, 0.87);
  border: 1px solid rgba(5, 42, 68, 0.2);
  border-radius: 3px;
  font-size: 1em;
  line-height: 1.2em;
  align-self: stretch;
`;

const Input = styled.input<{ $size?: 'sm' | 'md' | 'lg'; $filled?: boolean }>`
  ${inputReset};

  padding: 0.7em 0.9em;

  ${props =>
    props.$filled &&
    css`
      ${boxStyles}

      &:focus {
        border-color: #5168d9;
        outline: none;
      }
    `}

  ${props => {
    switch (props.$size) {
      case 'sm':
        return css`
          width: 5em;
        `;
      default:
      case 'md':
        return css`
          width: 20em;
        `;
      case 'lg':
        return css`
          width: 100%;
        `;
    }
  }}
`;

const Text = styled.div<{ $left?: boolean; $right?: boolean }>`
  margin: 0 0.8em;
  font-size: 0.95em;

  ${props =>
    props.$left &&
    css`
      margin-left: 0.2em;
    `}
  ${props =>
    props.$left &&
    css`
      margin-right: 0.2em;
    `}
`;

const InnerContainer = styled.div<{ $slim?: boolean }>`
  display: flex;
  font-size: 1em;
  line-height: 1.2em;
  width: 100%;
  align-self: stretch;
  align-items: center;

  &:focus-within {
    border-color: #5168d9;
    outline: none;
  }

  ${props =>
    props.$slim
      ? css`
          padding: 0 0.4em;
        `
      : css`
          padding: 0.7em 0.9em;
        `}

  ${boxStyles}
`;

const Divider = styled.div<{ $full?: boolean }>`
  margin: 0 1em;
  width: 1px;
  max-width: 1px;
  background: transparent;
  border-left: 1px solid rgba(5, 42, 68, 0.2);
  height: ${props => (props.$full ? '100%' : '80%')};
`;

const Spacer = styled.div`
  flex: 1;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
`;

const StackLabel = styled.label`
  font-size: 0.85em;
  font-weight: 600;
`;

const StackControl = styled.div`
  //background: red;
`;

const Button = styled.button`
  font-size: 0.85em;
  align-self: center;
  margin: 0 1em;
  color: #999;
  cursor: pointer;
  padding: 0.3em 0.8em;
  border-radius: 3px;
  border: 1px solid #f9f9f9;
  background: #fff;
  white-space: nowrap;

  &:hover {
    background: #f9f9f9;
    border-color: #ddd;
  }
`;

const InputRow = styled.div<{ $flex?: boolean }>`
  display: flex;
  padding: 0 0.2em;
  input:not(input:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  input ~ input {
    margin-left: 0;
    border-left-width: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  ${props =>
    props.$flex &&
    css`
      flex: 1 1 0px;
    `}
`;

const InputSplitRow = styled.div`
  display: flex;
  flex: 1;

  input {
    margin-left: 0.2em;
    margin-right: 0.2em;
  }

  input ~ input {
    margin-left: 0;
  }
`;

export const CompositeInput = {
  Container,
  Input,
  Text,
  InnerContainer,
  Divider,
  Stack,
  StackLabel,
  StackControl,
  Spacer,
  Button,
  InputRow,
  InputSplitRow,
};
