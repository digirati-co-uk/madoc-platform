import styled, { css } from 'styled-components';

export const EmptyState = styled.div<{ $box?: boolean; $noMargin?: boolean }>`
  text-align: center;
  color: #666;
  font-size: 0.8em;
  padding: 1.5em;
  margin: 100px 10px 10px 10px;

  ${props =>
    props.$noMargin &&
    css`
      margin-top: 10px;
    `}

  ${props =>
    props.$box &&
    css`
      border-radius: 3px;
      background: #eee;
    `}

  & ~ & {
    margin-top: 0;
  }
`;
