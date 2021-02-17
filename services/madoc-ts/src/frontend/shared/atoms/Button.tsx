import styled, { css } from 'styled-components';

export const Button = styled.button`
  cursor: pointer;
  font-size: 16px;
  line-height: 22px;
  padding: 3px 10px;
  background: #4265e9;
  color: #fff;
  border: 2px solid #4265e9;
  text-decoration: none;
  display: inline-block;
  vertical-align: top;
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
  }
  &:focus {
    outline: none;
    background: #7baaff;
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    &:hover {
      background: #4265e9;
      border-color: #4265e9;
    }
  }
`;

export const ButtonIcon = styled.span`
  svg {
    fill: #fff;
    font-size: 1.1em;
    transform: translate(0px, 3px);
    margin-right: 0.5em;
  }
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
  font-size: 12px;
  line-height: 14px;
  padding: 2px 10px;
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

export const ButtonRow = styled.div`
  margin: 1em 0;
  ${Button} ~ ${Button} {
    margin-left: .5em;
  }
`;
