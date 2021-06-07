import styled, { css } from 'styled-components';

export const SystemBackground = styled.div<{ $rounded?: boolean }>`
  padding: 3em;
  min-height: 100%;
  background: #d0d8e9;

  ${props =>
    props.$rounded &&
    css`
      border-radius: 5px;
    `}
`;
