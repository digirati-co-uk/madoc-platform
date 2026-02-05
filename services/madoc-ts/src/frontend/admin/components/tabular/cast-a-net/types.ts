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

export type HeaderRole = 'none' | 'header';

export interface HeaderCell {
  label: string;
  role: HeaderRole;
}

// Capture-model field plugin id, e.g. "text-field", "dropdown-field".
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
