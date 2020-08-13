import styled, { css } from 'styled-components';

export const TableContainer = styled.div`
  border: 1px solid #ddd;
  border-bottom: none;
  display: flex;
  flex-direction: column;
  margin: 1em 0;
`;

export const TableRow = styled.div<{ warning?: boolean; addition?: boolean; interactive?: boolean }>`
  border-bottom: 1px solid #ddd;
  padding: 6px;
  font-size: 0.8em;
  align-items: center;
  display: flex;
  width: 100%;
  background: ${props => (props.warning ? '#ffe0d0' : props.addition ? '#b7e3c2' : '#fff')};
  &:hover {
    ${props =>
      props.interactive
        ? props.addition
          ? css`
              background: #6da479;
            `
          : css`
              background: #eee;
            `
        : null};
  }
`;

export const TableRowLabel = styled.div`
  margin-left: 10px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const TableActions = styled.div`
  justify-self: flex-end;
  margin-left: auto;
  white-space: nowrap;
`;

export const TableEmpty = styled.div`
  padding: 2em;
  font-size: 1.3em;
  color: #444;
  background: #eee;
  text-align: center;
  border-bottom: 1px solid #ddd;
`;
