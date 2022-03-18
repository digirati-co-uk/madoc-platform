import styled, { css } from 'styled-components';

export const InlineFieldContainer = styled.div<{ $inline?: boolean; $light?: boolean }>`
  background: ${props => (props.$light ? '#fff' : 'rgba(5, 42, 68, 0.05)')};
  border: 1px solid rgba(5, 42, 68, 0.1);
  border-radius: 3px;

  ${props =>
    props.inline &&
    css`
      display: inline-block;
    `}
`;
