export type DragMode =
  | null
  | 'move'
  | 'resize-nw'
  | 'resize-ne'
  | 'resize-sw'
  | 'resize-se'
  | { type: 'row'; index: number }
  | { type: 'col'; index: number };

export type NetConfig = {
  rows: number;
  cols: number;

  // Net bounding box in % (relative to coordinate space = rendered canvas area)
  top: number;
  left: number;
  width: number;
  height: number;

  // Divider positions in % inside the net box (0..100, length = rows-1 / cols-1)
  rowPositions: number[];
  colPositions: number[];
};

export type HeaderRole = 'none' | 'header';

export interface HeaderCell {
  label: string;
  role: HeaderRole;
}

export type HeaderCellGrid = HeaderCell[][];
