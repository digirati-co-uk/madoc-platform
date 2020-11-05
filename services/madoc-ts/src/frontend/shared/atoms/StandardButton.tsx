import styled from 'styled-components';

type StandardButtonProps = {
  $size?: 'large' | 'medium' | 'small';
  $variation?: 'primary' | 'secondary' | 'tertiary';
};

const primary = '#2D70F9';
const primaryText = '#fff';

const secondary = 'none';
const secondaryText = primary;

const getFontSize = (props: StandardButtonProps) => {
  switch (props.$size) {
    case 'large':
      return '1.2em';
    case 'medium':
    default:
      return '0.95em';
    case 'small':
      return '0.75em';
  }
};

const getPadding = (props: StandardButtonProps) => {
  switch (props.$size) {
    case 'large':
      return '0.7em 1.2em';
    case 'medium':
    default:
      return '0.6em 1.2em';
    case 'small':
      return '0.1em 0.8em';
  }
};

export const StandardButton = styled.button<{
  $size?: 'large' | 'medium' | 'small';
  $variation?: 'primary' | 'secondary' | 'tertiary';
}>`
  cursor: pointer;
  font-size: ${getFontSize};
  line-height: 22px;
  font-weight: normal;
  padding: ${getPadding};
  background: ${props => (props.$variation === 'primary' ? primary : secondary)};
  color: ${props => (props.$variation === 'primary' ? primaryText : secondaryText)};
  border: 1px solid ${props => (props.$variation !== 'tertiary' ? primary : 'transparent')};
  text-decoration: none;
  &:active {
    box-shadow: inset 0 2px 8px 0 rgba(78, 130, 223, 0.6);
  }
  &:link,
  &:visited {
    color: #fff;
  }
  &:hover {
    background: #7baaff;
    border-color: #7baaff;
    color: #fff;
  }
  &:focus {
    outline: none;
    background: #7baaff;
    color: #fff;
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    &:hover {
      background: #4e82df;
      border-color: #4e82df;
    }
  }
`;
