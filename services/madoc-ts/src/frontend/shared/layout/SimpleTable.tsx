import styled, { css } from 'styled-components';

const Table = styled.table`
  width: 100%;
  border: 1px solid #eee;
  border-collapse: collapse;
  position: relative;
`;

const Row = styled.tr<{ $interactive?: boolean }>`
  border-bottom: 1px solid #eee;
  ${props =>
    props.$interactive &&
    css`
      &:hover {
        background: #f9f9f9;
      }
    `}
`;

const Cell = styled.td`
  padding: 0.65em;
  border-collapse: collapse;
`;

const Header = styled.th`
  padding: 0.65em;
  border-collapse: collapse;
  font-weight: 600;
  border-bottom: 1px solid #dddddd;
  background-color: #f7f7f7;
  text-align: start;
  top: 0;
  position: sticky;
`;

export const SimpleTable = {
  Table,
  Row,
  Cell,
  Header,
};
