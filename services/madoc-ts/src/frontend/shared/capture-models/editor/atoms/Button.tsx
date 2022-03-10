import styled, { css } from 'styled-components';

export const Button = styled.button<{
  primary?: boolean;
  fluid?: boolean;
  alert?: boolean;
  selected?: boolean;
  size?: 'tiny' | 'mini' | 'small';
}>`

  background: rgba(5,42,68,0.05);
  color: rgba(5,42,68,0.7);
  font-size: 1em;
  padding: .5em .8em;
  border: 1px solid rgba(5,42,68,0.2);
  border-radius: 3px;
  cursor: pointer;
  display: inline-block;
  margin: .14285714em;

  &:hover {
    background: rgba(5,42,68,0.2);
  }
  
  & > & {
    margin-left: 1em;
  }
  
 
  &:disabled {
    opacity: .5;
  }
  
  ${props =>
    props.fluid &&
    css`
      width: 100%;
    `}
  
  ${props =>
    props.primary &&
    css`
      border: 1px solid #034590;
      background: #005cc5;
      &:hover {
        background: #1468cb;
      }
      color: #fff;
    `}
  
  ${props =>
    props.selected &&
    css`
      background: rgba(5, 42, 68, 0.2);
      &:hover {
        border-color: rgba(5, 42, 68, 0.6);
      }
    `}
 
  ${props =>
    props.alert &&
    css`
      background: #ba321c;
      border-color: #610000;
      &:hover {
        background: #a71e08;
      }
      color: #fff;
    `}
  
  
  ${props =>
    props.size === 'small' &&
    css`
      font-size: 0.9em;
    `}
  ${props =>
    props.size === 'tiny' &&
    css`
      font-size: 0.8em;
    `}
  ${props =>
    props.size === 'mini' &&
    css`
      font-size: 0.7em;
    `}
`;
