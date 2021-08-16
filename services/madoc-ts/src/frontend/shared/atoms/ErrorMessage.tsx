import styled, { css } from 'styled-components';

export const ErrorMessage = styled.div<{ $small?: boolean }>`
  background: #a90e21;
  color: #fff;
  width: 100%;
  padding: 0.5em 1em;
  line-height: 1.9em;

  ${props =>
    props.$small &&
    css`
      font-size: 0.75em;
      padding: 0.25em 0.5em;
      line-height: 1.6em;
    `}
`;
