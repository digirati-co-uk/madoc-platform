export type NetConfig = {
  rows: number;
  cols: number;
  top: number;
  left: number;
  width: number;
  height: number;
  rowPositions: number[];
  colPositions: number[];
};

export type TabularCellRef = { row: number; col: number };
