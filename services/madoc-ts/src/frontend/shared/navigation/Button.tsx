import React from 'react';
import styled, { css } from 'styled-components';
import { HrefLink } from '../utility/href-link';

export const ButtonIcon = styled.div`
  transform: translate(-5px, -6px);
  height: 0.85em;
  width: 1.5em;
  position: relative;
  display: block;
  svg {
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
  $disabled?: boolean;
  $link?: boolean;
}>`
  cursor: pointer;
  padding: 0.4em 1em;
  align-items: center;
  font-size: 0.9em;
  line-height: 1.18em;
  border-radius: 3px;
  background: #fff;
  text-decoration: none;
  display: inline-flex;
  letter-spacing: 0.25px;
  vertical-align: top;
  transition: color 0.1s, background-color 0.1s, border-color 0.1s;
  white-space: nowrap;

  // Alternative with github style gradient
  background: linear-gradient(180deg, #fafbfc 0%, #eff3f6 90%);
  border: 1px solid rgba(27, 31, 35, 0.15);
  color: #333;

  &[type='submit'] {
    background: linear-gradient(180deg, #fafbfc 0%, #eff3f6 90%);
  }

  ${props =>
    props.$link &&
    css`
      border-color: transparent;
    `}

  ${props =>
    props.$large &&
    css`
      font-size: 1.15em;
      padding: 0.6em 1.2em;
    `}

  &:active {
    //box-shadow: inset 0 2px 8px 0 rgba(39, 75, 155, 0.8);
    // Alternative with github style gradient
    box-shadow: inset 0 2px 8px 0 rgba(27, 31, 35, 0.15);
  }

  &:link,
  &:visited {
    color: #333;
  }

  &:hover,
  &:focus {
    // Alternative with github style gradient
    background: linear-gradient(180deg, #f0f3f6 0%, #e6ebf1 90%);
    border-color: rgba(27, 31, 35, 0.15);
    color: #000;
  }

  &:focus {
    outline: none;
  }

  &:disabled,
  &[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  ${ButtonIcon} svg {
    fill: #333;
  }

  ${props =>
    props.$primary &&
    css`
      background: #4265e9;
      color: #fff;
      border: 1px solid #4265e9;

      &[type='submit'] {
        background: #4265e9;
      }
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
        color: #fff;
      }
      &:focus,
      &:focus:hover {
        background: #4265e9;
        border-color: #4265e9;
        color: #fff;
      }
      &:focus-visible {
        box-shadow: inset 0 0px 0px 2px rgba(255, 255, 255, 0.8);
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
    props.$error
      ? props.$primary
        ? css`
            background: #a90e21;
            color: #fff;
            border: 1px solid #a90e21;

            &:active {
              box-shadow: inset 0 2px 8px 0 rgba(118, 9, 51, 0.8);
            }

            &:link,
            &:visited {
              color: #fff;
            }

            &:focus,
            &:focus:hover {
              color: #fff;
              background: #a90e21;
              border-color: #a90e21;
            }

            &:hover {
              background: #d91a45;
              border-color: #a90e21;
            }

            &:disabled {
              opacity: 0.7;
              cursor: not-allowed;
            }
          `
        : css`
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
          `
      : css``}

  ${props =>
    props.$inlineInput &&
    css`
      height: 2.7em;
      border-radius: 0 3px 3px 0;
    `}
  
  ${props =>
    props.$disabled &&
    css`
      opacity: 0.8;
      cursor: not-allowed;
      pointer-events: none;
    `}
`;

export const SmallButton = styled(Button)`
  padding: 0.25em 0.75em;
  font-size: 0.8em;
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

export const TextButton = styled.button<{ $inherit?: boolean }>`
  border: none;
  outline: none;
  background: transparent;
  margin: 0;
  padding: 0;
  font-size: inherit;
  color: ${props => (props.$inherit ? 'inherit' : '#000000')};
  cursor: pointer;
  font-weight: inherit;
  svg {
    fill: ${props => (props.$inherit ? 'inherit' : '#555555')};
    color: ${props => (props.$inherit ? 'inherit' : '#555555')};
    height: 16px;
    width: 16px;
    vertical-align: middle;
  }
  &:hover {
    color: ${props => (props.$inherit ? 'inherit' : '#555555')};
    background: ${props => (props.$inherit ? 'inherit' : '#f9f9f9')};
    border-bottom: 1px dotted #555555;
  }
  &:focus {
    color: ${props => (props.$inherit ? 'inherit' : '#397cf6')};
  }
`;

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
  align-items: center;
  display: flex;
  &:hover {
    color: ${props => (props.$inherit ? 'inherit' : '#42a0db')};
  }
  &:disabled {
    color: red;
  }
`;

export const ButtonRow = styled.div<{ $noMargin?: boolean; $right?: boolean; $center?: boolean }>`
  display: flex;
  justify-content: ${props => (props.$right ? 'flex-end' : props.$center ? 'center' : 'flex-start')};
  align-items: ${props => (props.$right ? 'flex-end' : 'flex-start')};

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
