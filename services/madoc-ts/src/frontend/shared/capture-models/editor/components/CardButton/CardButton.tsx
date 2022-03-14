import styled from 'styled-components';
import { getTheme } from '../../themes';

export const CardButton = styled.button<{ size?: 'large' | 'medium' | 'small'; shadow?: boolean; inline?: boolean }>`
  box-sizing: border-box;
  background: ${props => getTheme(props).colors.primary};
  color: ${props => getTheme(props).colors.textOnPrimary};
  margin-bottom: ${props => {
    const size = getTheme(props).card[props.size === 'large' ? 'large' : 'small'];
    if (size && size.margin) {
      return size.margin;
    }
    return 0;
  }};
  padding: ${props => (props.size === 'large' ? '0.75em 1.2em' : '.6em 1.2em')};
  width: ${props => (props.inline ? 'auto' : '100%')};
  box-shadow: ${props => (props.shadow ? getTheme(props).card.shadow : 'none')};
  border-radius: 4px;
  font-weight: 500;
  border: none;
  text-align: center;
  font-size: ${props => {
    switch (props.size) {
      case 'large':
        return getTheme(props).sizes.buttonLg;
      case 'medium':
        return getTheme(props).sizes.buttonMd;
      case 'small':
        return getTheme(props).sizes.buttonSm;
      default:
        return getTheme(props).sizes.buttonMd;
    }
  }};
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: ${props => getTheme(props).card.shadow};
  &:disabled {
    opacity: 0.5;
    cursor: initial;
  }
  &:hover {
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(1px);
  }
  &:focus {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: -4px;
    &:active {
      outline: none;
    }
  }
`;
