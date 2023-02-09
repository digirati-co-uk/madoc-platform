import styled, { css } from 'styled-components';

export const TaskTabBackground = styled.div<{ $sticky?: boolean }>`
  background: #5677f3;
  margin-bottom: 1em;
  padding-top: 0.4em;
  padding-left: 0.2em;
  padding-right: 0.2em;
  ${props =>
    props.$sticky &&
    css`
      position: sticky;
      top: -0.25px;
      z-index: 9;
    `}
`;

export const TaskTabRow = styled.ul`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
  overflow-y: auto;
`;

export const TaskTabItem = styled.li<{ $active?: boolean }>`
  padding: 0.75em 2em;
  margin: 0 0.2em;
  font-size: 0.75em;
  color: #fff;
  background: #3c5cd2;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    //background: rgba(255, 255, 255, 0.2);
    background: #dcebfe;
    color: #000;
  }
  ${props =>
    props.$active &&
    css`
      background: #fff;
      color: #000;
      &:hover {
        background: #fff;
      }
    `}
`;
