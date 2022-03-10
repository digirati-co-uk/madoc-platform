import styled, { css } from 'styled-components';

export const List = styled.div`
  display: flex;
  flex-direction: column;
  color: #333;
`;
export const ListItem = styled.div`
  padding: 0.4em 0.8em;
  display: flex;
  align-items: center;
  border-radius: 3px;
  cursor: pointer;
  &:hover {
    background: #eee;
  }
`;
export const ListHeader = styled.div`
  font-size: 1.1em;
  margin-left: 1em;
`;
export const ListContent = styled.div<{ fluid?: boolean }>`
  ${props =>
    props.fluid &&
    css`
      flex: 1 1 0px;
    `}
`;
export const ListDescription = styled.div`
  color: #999;
  margin-left: 1em;
`;
