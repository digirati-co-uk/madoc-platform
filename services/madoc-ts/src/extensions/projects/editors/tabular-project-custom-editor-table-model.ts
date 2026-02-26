export type TabularEditorHeaderModel = {
  key: string;
  label: string;
  description?: string;
};

export type TabularEditorCellModel = {
  key: string;
  rowIndex: number;
  colIndex: number;
  columnKey: string;
  fieldType?: string;
  value: unknown;
  cellElementId: string;
  inputId: string;
  onChange: (nextValue: unknown) => void;
};

export type TabularEditorRowModel = {
  key: string;
  rowIndex: number;
  cells: TabularEditorCellModel[];
};
