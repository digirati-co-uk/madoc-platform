import React from 'react';
import styled, { css } from 'styled-components';
import { HrefLink } from '../utility/href-link';

export const ButtonIcon = styled.span`
  transform: translate(-8px, -4px);
  height: 0.85em;
  width: 1.5em;
  position: relative;
  display: inline-block;
  svg {
    position: absolute;
    left: 0;
    top: 0;
    fill: #fff;
    height: 24px;
    width: 24px;
  }
`;

export const Button = styled.button<{
  $primary?: boolean;
  $success?: boolean;
  $error?: boolean;
  $inlineInput?: boolean;
  $large?: boolean;
}>`
  cursor: pointer;
  padding: 0.4em 1em;
  font-size: 0.9em;
  line-height: 1.18em;
  border-radius: 3px;
  background: #fff;
  color: #3579f6;
  border: 1px solid #4265e9;
  text-decoration: none;
  display: inline-block;
  letter-spacing: 0.25px;
  vertical-align: top;
  transition: color 0.1s, background-color 0.1s, border-color 0.1s;
  white-space: nowrap;
  
  ${props =>
    props.$large &&
    css`
      font-size: 1.15em;
      padding: 0.6em 1.2em;
    `}

  &:active {
    box-shadow: inset 0 2px 8px 0 rgba(39, 75, 155, 0.8);
  }

  &:link,
  &:visited {
    color: #3579f6;
  }

  &:hover {
    background: #4265e9;
    border-color: #4265e9;
    color: #fff;
  }

  &:focus {
    outline: none;
    color: #fff;
    background: #4265e9;
    border-color: #4265e9;
  }

  &:focus:hover {
    border-color: #4265e9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      color: #4265e9;
      background: #fff;
      border-color: #4265e9;
    }
  }

  ${ButtonIcon} svg {
    fill: #4265e9;
  }
  &:hover ${ButtonIcon} svg,
  &:focus ${ButtonIcon} svg {
    fill: #fff;
  }

  ${props =>
    props.$primary &&
    css`
      background: #4265e9;
      color: #fff;
      border: 1px solid #4265e9;
      &:active {
        box-shadow: inset 0 2px 8px 0 rgba(39, 75, 155, 0.8);
      }
      &:link,
      &:visited {
        color: #fff;
      }
      &:hover {
        background: #5371e9;
        border-color: #5371e9;
      }
      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;

        &:hover {
          background: #4265e9;
          border-color: #4265e9;
          color: #fff;
        }
      }
    `}

  ${props =>
    props.$success &&
    css`
      background: #4dac22;
      color: #fff;
      border: 1px solid #4dac22;

      &:active {
        background: #4dac22;
        border-color: #4dac22;
        box-shadow: inset 0 2px 8px 0 rgb(56, 155, 39);
      }

      &:focus,
      &:focus:hover {
        background: #4dac22;
        border-color: #4dac22;
      }

      &:link,
      &:visited {
        color: #fff;
      }

      &:hover {
        background: #4dac22;
        border-color: #4dac22;
      }

      &:disabled {
        opacity: 0.9;
        cursor: not-allowed;

        &:hover {
          background: #4dac22;
          border-color: #4dac22;
          color: #fff;
        }
      }
    `}
  
  ${props =>
    props.$error &&
    css`
      background: #fff;
      color: #a90e21;
      border: 1px solid #a90e21;

      &:active {
        background: #fff;
        border-color: #a90e21;
        box-shadow: inset 0 2px 8px 0 #ffd6dd;
      }

      &:focus,
      &:focus:hover {
        color: #a90e21;
        background: #fff;
        border-color: #a90e21;
      }

      &:link,
      &:visited {
        color: #a90e21;
      }

      &:hover {
        background: #fff;
        color: #a90e21;
        border-color: #a90e21;
      }

      &:disabled {
        opacity: 0.9;
        cursor: not-allowed;

        &:hover {
          background: #fff;
          border-color: #a90e21;
          color: #a90e21;
        }
      }
    `}

  ${props =>
    props.$inlineInput &&
    css`
      height: 2.7em;
      border-radius: 0 3px 3px 0;
    `}
`;

export const RoundedButton = styled.a<{ disabled?: boolean }>`
  cursor: pointer;
  font-size: 16px;
  line-height: 22px;
  padding: 3px 10px;
  background: #ffffff;
  color: #007bff;
  border: 1px solid #dee2e6;
  text-decoration: none;
  border-radius: 4px;

  &:link,
  &:visited {
    color: #007bff;
  }
  &:hover {
    background: #ffffff;
    border-color: #dee2e6;
  }
  &:focus {
    outline: 1px solid #dee2e6;
  }
  ${props =>
    props.disabled &&
    css`
      opacity: 0.7;
      pointer-events: none;
    `}
`;

export const SmallButton = styled(Button)`
  padding: 0.25em 0.75em;
  font-size: 0.8em;
`;

export const SmallRoundedButton = styled(RoundedButton)`
  font-size: 12px;
  line-height: 14px;
  padding: 2px 10px;
`;

export const MediumRoundedButton = styled.a`
  cursor: pointer;
  font-size: 16px;
  line-height: 22px;
  background: #ffffff;
  color: #007bff;
  border: 1px solid #dee2e6;
  text-decoration: none;
  padding: 10px;

  &:link,
  &:visited {
    color: #007bff;
  }
  &:hover {
    background: #ffffff;
    border-color: #dee2e6;
  }
  &:focus {
    outline: 1px solid #dee2e6;
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    &:hover {
      background: #4265e9;
      border-color: #dee2e6;
    }
  }
  &:last-of-type {
    border-radius: 0px 4px 4px 0px;
  }
  &:first-of-type {
    border-radius: 4px 0px 0px 4px;
  }
`;

export const TinyButton = SmallButton;

export const LinkButton = styled.button<{ $inherit?: boolean }>`
  border: none;
  outline: none;
  background: transparent;
  margin: 0;
  padding: 0;
  font-size: inherit;
  color: ${props => (props.$inherit ? 'inherit' : '#5071f4')};
  text-decoration: underline;
  cursor: pointer;
  &:hover {
    color: ${props => (props.$inherit ? 'inherit' : '#42a0db')};
  }
`;

export const ButtonRow = styled.div<{ $noMargin?: boolean }>`
  ${props =>
    props.$noMargin
      ? ''
      : css`
          margin: 1em 0;
        `}
  & > * ~ * {
    margin-left: 0.5em;
  }
`;

export const RightButtonIconBox = styled.span<{ $checked?: boolean }>`
  transform: translate(0, 1px);
  height: 1em;
  width: 1em;
  position: relative;
  display: inline-block;
  border: 1px solid #ccc;
  margin-left: 0.5em;

  ${Button}:focus &,
  ${Button}:hover & {
    border-color: rgba(255, 255, 255, 0.5);
    svg {
      fill: #fff;
    }
  }

  ${Button}:disabled {
    pointer-events: none;
  }

  svg {
    display: none;
    transform: translate(-4px, -8px);
    position: absolute;
    left: 0;
    top: 0;
    height: 24px;
    width: 24px;
    fill: #5071f4;
  }

  ${props =>
    props.$checked &&
    css`
      svg {
        display: block;
      }
    `}
`;

export const PrimaryButtonLink: React.FC<any> = props => {
  return <Button as={HrefLink} $primary {...props} />;
};
