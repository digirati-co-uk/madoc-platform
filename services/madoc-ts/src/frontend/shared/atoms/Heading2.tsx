import styled, { css } from 'styled-components';

export const Heading2 = styled.h2<{ $margin?: boolean }>`
  font-size: 1.75em;
  font-weight: 600;
  margin-bottom: 0.2em;
  ${props =>
    props.$margin &&
    css`
      margin-bottom: 1em;
    `}
`;
