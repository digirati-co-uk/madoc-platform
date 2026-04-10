type TabularDataGridStylesProps = {
  scopeClassName: string;
  disableRowHover?: boolean;
};

export function TabularDataGridStyles({ scopeClassName, disableRowHover = false }: TabularDataGridStylesProps) {
  const normalizedClassName = scopeClassName.startsWith('.') ? scopeClassName.slice(1) : scopeClassName;
  const selector = `.${normalizedClassName}`;

  return (
    <style>
      {`
        ${selector} .rdg-cell[aria-selected="true"] {
          outline: none !important;
        }
        ${selector} .rdg-cell {
          border-inline-end: 1px solid #d6d6d6 !important;
          border-block-end: 1px solid #d6d6d6 !important;
          padding: 0 !important;
        }
        ${selector} .rdg-header-row .rdg-cell {
          padding: 0 !important;
          white-space: normal !important;
          text-overflow: clip !important;
        }
        ${selector} .rdg-header-row .rdg-cell > * {
          white-space: normal !important;
          overflow-wrap: anywhere;
          word-break: break-word;
          line-height: 1.3;
        }
        ${selector} .rdg-cell-drag-over {
          background: #e8edff !important;
        }
        ${selector} .rdg-cell-drag-over::after {
          content: '';
          position: absolute;
          inset: 4px;
          border: 2px dotted #6f84e8;
          border-radius: 6px;
          pointer-events: none;
        }
        ${selector} .rdg-cell-dragging {
          opacity: 0.92;
        }
        ${selector} .tabular-heading-cell:not([role='columnheader']) {
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.24), 0 4px 12px rgba(15, 23, 42, 0.18);
          border-radius: 6px;
        }
        ${
          disableRowHover
            ? `${selector} .rdg-row:hover {
          background: inherit !important;
        }`
            : ''
        }
      `}
    </style>
  );
}
