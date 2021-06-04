import styled, { css } from 'styled-components';

export const SystemListItem = styled.div<{ $enabled?: boolean; $connected?: boolean }>`
  padding: 1em;
  margin-left: auto;
  margin-right: auto;
  background: #fff;
  border: 2px solid transparent;
  border-radius: 5px;
  display: flex;
  max-width: 800px;

  ${props =>
    props.$enabled &&
    css`
      border-color: #1c8c59;
    `}

  & ~ & {
    margin-top: 1em;
  }

  ${props =>
    props.$connected &&
    css`
      border-radius: 0px 0px 5px 5px;
      border-top: 1px solid #d2d8e8;
      margin-top: -0.25em !important;
      padding-top: 1.25em;
      background: #f5f8ff;
    `}
`;
