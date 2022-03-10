import styled, { css } from 'styled-components';
import { Button } from './Button';

export const Card = styled.div<{ fluid?: boolean }>`
  max-width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #fff;
  padding: 0;
  border: none;
  border-radius: 5px;
  box-shadow: 0 1px 3px 0 #d4d4d5, 0 0 0 1px #d4d4d5;
  
  width: 290px;
  ${props =>
    props.fluid &&
    css`
      width: 100%;
    `}
  
  & > ${Button} {
    border-radius: 0 0 4px 4px;
    border: none;
  }
`;

export const CardHeader = styled.div`
  font-size: 1.2em;
  line-height: 1.4em;
  font-weight: bold;
`;

export const CardMeta = styled.div`
  color: #999;
  font-size: 0.9em;
  line-height: 1.3em;
`;

export const CardContent = styled.div<{ extra?: boolean; textAlign?: 'left' | 'right' }>`
  flex-grow: 1;
  border: none;
  background: 0 0;
  margin: 0;
  padding: 0 1em;
  box-shadow: none;
  font-size: 1em;
  border-radius: 0;

  ${props =>
    props.textAlign === 'right' &&
    css`
      text-align: right;
    `}

  ${props =>
    props.extra &&
    css`
      max-width: 100%;
      min-height: 0;
      flex-grow: 0;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      position: static;
      background: 0 0;
      width: auto;
      margin: 0 0;
      padding: 0.75em 1em;
      top: 0;
      left: 0;
      box-shadow: none;
    `}
`;
