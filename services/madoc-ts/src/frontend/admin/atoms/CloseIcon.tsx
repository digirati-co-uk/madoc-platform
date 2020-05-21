import styled, { css } from 'styled-components';
import * as React from 'react';

export const CloseIcon = styled(props => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
))`
  fill: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  &:hover {
    fill: rgba(0, 0, 0, 1);
  }
  ${props =>
    props.disabled
      ? css`
          pointer-events: none;
          opacity: 0.6;
        `
      : ''}
`;
