export type TabularRowOffsetAdjustment = {
  startRow: number;
  offsetPctOfPage: number;
};

export type NetConfig = {
  rows: number;
  cols: number;
  top: number;
  left: number;
  width: number;
  height: number;
  rowPositions: number[];
  colPositions: number[];
  rowOffsetAdjustments: TabularRowOffsetAdjustment[];
};

export type TabularCellRef = { row: number; col: number };
