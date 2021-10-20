import styled, { css } from 'styled-components';
import { Button } from '../navigation/Button';

export const InfoMessage = styled.div.attrs(() => ({ 'data-cy': 'info-message' }))<{ $wide?: boolean }>`
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

  ${props =>
    props.$wide &&
    css`
      margin-left: -2em;
      margin-right: -2em;
      width: auto;
    `}
`;
