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
  top: number;
  left: number;
  width: number;
  height: number;
  rowPositions: number[];
  colPositions: number[];
};

export type CastANetPoint = { x: number; y: number };
export type TabularCellRef = { row: number; col: number };

export type CastANetMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type CastANetColumnStructure = {
  index: number;
  leftPctOfTable: number;
  leftPctOfPage: number;
  widthPctOfTable: number;
  widthPctOfPage: number;
  isBlank: boolean;
};

export type CastANetRowStructure = {
  index: number;
  topPctOfTable: number;
  topPctOfPage: number;
  heightPctOfTable: number;
  heightPctOfPage: number;
};

export type CastANetStructure = {
  topLeft: CastANetPoint;
  topRight: CastANetPoint;
  marginsPct: CastANetMargins;
  tableBoxPct: {
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };
  columnCount: number;
  rowCount: number;
  columnWidthsPctOfPage: number[];
  rowHeightsPctOfPage: number[];
  blankColumnIndexes: number[];
  columns: CastANetColumnStructure[];
  rows: CastANetRowStructure[];
};

export type CastANetPayload = {
  topLeft: CastANetPoint;
  topRight: CastANetPoint;
  marginsPct: CastANetMargins;
  columnCount: number;
  columnWidthsPctOfPage: number[];
  rowHeightsPctOfPage: number[];
  blankColumnIndexes: number[];
};

export type HeaderRole = 'none' | 'header';

export interface HeaderCell {
  label: string;
  role: HeaderRole;
}

export type TabularFieldType = string;

export type TabularColumn = {
  id: string;
  label: string;
  type?: TabularFieldType;
  fieldType?: TabularFieldType;
  helpText?: string;
  saved?: boolean;
};

export type TabularCaptureModelField = {
  type: string;
  label: string;
  description?: string;
};

export type TabularCaptureModelFields = Record<string, TabularCaptureModelField>;

export type TabularCaptureModelTemplate = {
  __entity__?: { label: string };
  [term: string]: TabularCaptureModelField | { label: string } | undefined;
};

export type TabularModelPayload = {
  columns: TabularColumn[];
  captureModelFields: TabularCaptureModelFields;
  captureModelTemplate: TabularCaptureModelTemplate;
};

export type TabularProjectSetupPayload = {
  structure: CastANetPayload;
  model: TabularModelPayload;
};

export type TabularValidationIssue = {
  type:
    | 'empty-heading'
    | 'duplicate-heading'
    | 'invalid-heading-length'
    | 'invalid-column-count'
    | 'duplicate-column-id'
    | 'empty-column-id'
    | 'missing-field-type';
  message: string;
  columnIndex?: number;
};

export type TabularColumnMeta = {
  fieldTypes?: (TabularFieldType | undefined)[];
  helpText?: (string | undefined)[];
  saved?: (boolean | undefined)[];
};

export type TabularModelChange = {
  isValid: boolean;
  issues: TabularValidationIssue[];
  payload: TabularModelPayload;
};

export type DefineTabularModelValue = {
  columns: number;
  previewRows: number;
  headings: string[];
  fieldTypes?: (TabularFieldType | undefined)[];
  helpText?: (string | undefined)[];
  saved?: (boolean | undefined)[];
};

export type TabularColumnEditorValue = {
  heading: string;
  fieldType?: TabularFieldType;
  helpText?: string;
};

export type TabularFieldPlugin = {
  type: string;
  label: string;
  description: string;
};
