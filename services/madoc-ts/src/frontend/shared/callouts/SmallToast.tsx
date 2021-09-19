import styled, { css } from 'styled-components';

export const SmallToast = styled.div<{ $active?: boolean }>`
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 0.5em 1em;
  border-radius: 1em;
  opacity: 0;
  font-size: 0.8em;
  display: inline-block;
  transition: opacity 0.4s;

  ${props =>
    props.$active &&
    css`
      opacity: 1;
    `}
`;
