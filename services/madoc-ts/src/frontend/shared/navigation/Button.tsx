import React from 'react';
import styled, { css } from 'styled-components';
import { HrefLink } from '../utility/href-link';
import {
  primaryBtnBackground,
  primaryBtnBorder,
  primaryBtnBorderRadius,
  primaryBtnColor,
  primaryBtnHover
} from '../variables';

const darkenColor = (value: number) => css`
  background-image: linear-gradient(0deg, rgba(0, 0, 0, ${value}) 0%, rgba(0, 0, 0, ${value}) 100%);
`;

const primary = css`
  background-color: ${primaryBtnBackground};
  color: ${primaryBtnColor};
  border: ${primaryBtnBorder};
  border-radius: ${primaryBtnBorderRadius};
  z-index: 1;

  &:active {
    box-shadow: inset 0 2px 8px 0 rgba(0, 0, 0, 0.15);
  }
  &:hover {
    ${primaryBtnHover};
  }

  &:focus-visible {
    box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.8);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;

    &:hover {
      ${primaryBtnHover}
    }
  }
`;
const success = css`
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
`;
const error = css`
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
`;
const errorPrimary = css`
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
`;

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
  $disabled?: boolean;
  $link?: boolean;
  $accColor?: string;
}>`
  cursor: pointer;
  padding: 0.4em 1em;
  font-size: 0.9em;
  line-height: 1.18em;
  // border-radius: buttonRadius};
  // color: buttonColor};
  background: inherit;
  text-decoration: none;
  display: inline-block;
  letter-spacing: 0.25px;
  vertical-align: top;
  transition: color 0.1s, background-color 0.1s, border-color 0.1s;
  white-space: nowrap;
  // border: 1px solid buttonColor};
  z-index: 0;
  
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
    box-shadow: inset 0 2px 8px 0 rgba(0, 0, 0, 0.15);
  }
  
  &:hover {
    // background:{buttonColor};
    // border-color: buttonColor};
    // color:{BtnColor};
  }

  &:focus {
    outline: none;
    // color: {BtnColor};
    // background:{buttonColor};
    // border-color: {buttonColor};
    box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.8);
  }

  &:focus:hover {
    ${darkenColor(0.1)};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${ButtonIcon} svg {
    // fill: buttonColor};
  }

  &:hover ${ButtonIcon} svg,
  &:focus ${ButtonIcon} svg {
    fill: #fff;
  }

  ${props => props.$primary && primary}
  ${props => props.$success && success}
  ${props => (props.$error ? (props.$primary ? errorPrimary : error) : '')}
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

export const RoundedButton = styled.a<{ disabled?: boolean }>`
  cursor: pointer;
  font-size: 16px;
  line-height: 22px;
  padding: 3px 10px;
  // background: BtnColor};
  // color: buttonColor};
  border: 1px solid #dee2e6;
  text-decoration: none;
  border-radius: 4px;

  ${props =>
    !props.disabled &&
    css`
      &:link,
      &:hover {
        ${darkenColor(0.1)};
      }
      &:focus {
        outline: 1px solid #dee2e6;
      }
    `}
  ${props =>
    props.disabled &&
    css`
      pointer-events: none;
      cursor: not-allowed;
      background: #eee;
      color: #777b80;
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
  // color:{buttonColor};
  // border: 1px solid buttonColor};
  text-decoration: none;
  padding: 10px;

  &:link,
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
      cursor: not-allowed;
    }
  }
  &:last-of-type {
    border-radius: 0 4px 4px 0;
  }
  &:first-of-type {
    border-radius: 4px 0 0 4px;
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
  // color: ${props => (props.$inherit ? 'pink' : 'bttoncolor')};
  text-decoration: underline;
  cursor: pointer;
  &:hover {
    ${props =>
      props.$inherit
        ? css`
            color: inherit;
          `
        : darkenColor(0.1)}
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
    // fill: btncolor;
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
