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
