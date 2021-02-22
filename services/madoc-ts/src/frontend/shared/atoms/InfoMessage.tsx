import styled from 'styled-components';
import { Button } from './Button';

export const InfoMessage = styled.div.attrs(() => ({ 'data-cy': 'info-message' }))`
  background: #5476e9;
  color: #fff;
  width: 100%;
  padding: 0.5em 1em;
  line-height: 1.9em;

  a {
    color: #fff;
  }

  ${Button} {
    background: #1136b8;
    border-color: #1136b8;
    color: #fff;
  }
`;
