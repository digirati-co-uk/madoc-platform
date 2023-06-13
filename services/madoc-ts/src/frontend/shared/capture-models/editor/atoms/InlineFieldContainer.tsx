import styled from 'styled-components';

export const InlineFieldContainer = styled.div<{ $inline?: boolean; $light?: boolean }>`
  background: rgba(5, 42, 68, 0.05);
  border: 1px solid rgba(5, 42, 68, 0.1);
  border-radius: 3px;

  &:focus-within {
    border-color: #005cc5;
  }

  &[data-inline='true'] {
    display: inline-block;
  }
`;
