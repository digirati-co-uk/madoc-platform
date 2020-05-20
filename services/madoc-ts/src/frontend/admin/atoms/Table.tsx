import styled from 'styled-components';

export const TableContainer = styled.div`
  border: 1px solid #ddd;
  border-bottom: none;
  display: flex;
  flex-direction: column;
  margin: 1em 0;
`;

export const TableRow = styled.div<{ warning?: boolean; interactive?: boolean }>`
  border-bottom: 1px solid #ddd;
  padding: 4px;
  font-size: 0.8em;
  align-items: center;
  display: flex;
  width: 100%;
  background: ${props => (props.warning ? '#ffe0d0' : '#fff')};
  &:hover {
    background: ${props => (props.interactive ? '#eee' : '#fff')};
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
