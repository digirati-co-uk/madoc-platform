import styled, { css } from 'styled-components';

export const SuccessMessage = styled.div<{ $margin?: boolean }>`
  background: #337c34;
  color: #fff;
  width: 100%;
  padding: 0.5em 1em;
  line-height: 1.9em;

  a {
    color: #fff;
  }

  ${props =>
    props.$margin &&
    css`
      margin-bottom: 1em;
    `}
`;
