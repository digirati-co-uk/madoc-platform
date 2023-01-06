import React from 'react';
import styled, { css } from 'styled-components';
import { HrefLink } from '../utility/href-link';
import { themeVariable } from '../../themes/helpers/themeVariable';

export const primaryColor = themeVariable('primaryButton', 'color', {
  default: '#FFFFFF',
});

export const primaryBackground = themeVariable('primaryButton', 'background', {
  default: '#4265e9',
});

export const primaryBorderRadius = themeVariable('primaryButton', 'borderRadius', {
  default: '3px',
});

export const primaryBorder = themeVariable('primaryButton', 'border', {
  default: '1px solid #4265e9',
});

export const primaryHoverBackground = themeVariable('primaryButtonHover', 'background', {
  default: 'transparent',
});

export const primaryHoverBorder = themeVariable('primaryButtonHover', 'border', {
  default: '1px solid #4265e9',
});

export const primaryHoverColor = themeVariable('primaryButtonHover', 'color', {
  default: '#4265e9',
});

export const defaultColor = themeVariable('defaultButton', 'color', {
  default: '#4265e9',
});

export const defaultBorderRadius = themeVariable('defaultButton', 'borderRadius', {
  default: '3px',
});

export const defaultBorder = themeVariable('defaultButton', 'border', {
  default: '1px solid #4265e9',
});

export const defaultHoverBackground = themeVariable('defaultButtonHover', 'background', {
  default: '#4265e9',
});

export const defaultHoverColor = themeVariable('defaultButtonHover', 'color', {
  default: '#FFFFFF',
});

const primaryBtn = css`
  background-color: ${primaryBackground};
  color: ${primaryColor};
  border: ${primaryBorder};
  border-radius: ${primaryBorderRadius};
  z-index: 1;

  &:hover {
    background-color: ${primaryHoverBackground};
    color: ${primaryHoverColor};
    border: ${primaryHoverBorder};
  }

  &:focus,
  &:focus-visible {
    box-shadow: inset 0 0 0 2px ${primaryHoverColor};
  }
  &:active {
    box-shadow: inset 0 0 4px 0 ${primaryHoverColor};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;

    &:hover {
      background-color: ${primaryHoverBackground};
      color: ${primaryHoverColor};
      border: ${primaryHoverBorder};
    }
  }
`;
const iconBtn = css`
  svg {
    fill: ${primaryBackground};
  }
  background: transparent;
  border: transparent;
  margin: 0;
  padding: 0;

  &:hover {
    svg {
      fill: ${primaryBackground};
      filter: brightness(50%);
    }
  }
`;
const linkBtn = css`
  border: none;
  outline: none;
  background: transparent;
  margin: 0;
  font-size: inherit;
  color: #007bff;
  text-decoration: underline;
  padding: 0 0.4em;

  :hover {
    color: #42a0db;
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
  $icon?: boolean;
}>`
  cursor: pointer;
  padding: 0.4em 1em;
  font-size: 0.9em;
  line-height: 1.18em;
  border-radius: ${defaultBorderRadius};
  color: ${defaultColor};
  background-color: #fff;
  border: ${defaultBorder};
  text-decoration: none;
  display: inline-block;
  letter-spacing: 0.25px;
  vertical-align: top;
  transition: color 0.1s, background-color 0.1s, border-color 0.1s;
  white-space: nowrap;
  z-index: 0;
  
  svg, ${ButtonIcon} {
    fill: ${defaultColor};
  }
  
  &:hover {
     background: ${defaultHoverBackground};
     border-color: ${defaultHoverBackground}; 
     color: ${defaultHoverColor}; 
    
    svg, ${ButtonIcon} {
      fill: ${defaultHoverColor};
    }
  }
  
  &:active {
    box-shadow: inset 0 0 4px 0 ${defaultColor};
  }

  &:focus, &:focus-visible {
    outline: none;
    background: ${defaultHoverBackground}; 
    border-color: ${defaultHoverBackground}; 
    color: ${defaultHoverColor};
    svg   ${ButtonIcon} {
      fill: ${defaultHoverColor};
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      background: ${defaultHoverBackground};
      border-color: ${defaultHoverBackground};
      color: ${defaultHoverColor};
    }
  }
  
  ${props => props.$primary && primaryBtn}
  ${props => props.$success && success}
  ${props => props.$icon && iconBtn}
  ${props => props.$link && linkBtn}

  ${props => (props.$error ? (props.$primary ? errorPrimary : error) : '')}
  ${props =>
    props.$large &&
    css`
      font-size: 1.15em;
      padding: 0.6em 1.2em;
    `}
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

//pagination buttons
export const SmallRoundedButton = styled.a<{ disabled?: boolean }>`
  font-size: 12px;
  line-height: 14px;
  padding: 2px 10px;
  cursor: pointer;
  background: #ffffff;
  color: #007bff;
  border: 1px solid #dee2e6;
  text-decoration: none;
  border-radius: 4px;

  ${props =>
    !props.disabled &&
    css`
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

//pagination buttons
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
    border-radius: 0 4px 4px 0;
  }
  &:first-of-type {
    border-radius: 4px 0 0 4px;
  }
`;

export const SmallButton = styled(Button)`
  padding: 0.25em 0.75em;
  font-size: 0.8em;
`;

export const TinyButton = SmallButton;

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
