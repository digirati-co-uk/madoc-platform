import styled from 'styled-components';

const Table = styled.table`
  width: 100%;
  border: 1px solid #eee;
`;

const Row = styled.tr`
  &:hover {
    background: #eee;
  }
`;

const Cell = styled.td`
  padding: 0.3em;
  border-collapse: collapse;
`;

export const SimpleTable = {
  Table,
  Row,
  Cell,
};
