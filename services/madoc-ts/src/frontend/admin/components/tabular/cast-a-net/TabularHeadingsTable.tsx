import React, { useMemo } from 'react';
import { DataGrid, type Column } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import type { TabularValidationIssue } from './types';

export type TabularHeadingsTableProps = {
  columns: number;
  headings: string[];
  tooltips?: (string | undefined)[];
  onChangeHeadings: (next: string[]) => void;

  visibleRows?: number;

  activeColumn?: number;
  onActiveColumnChange?: (index: number) => void;

  issues?: TabularValidationIssue[];
  disabled?: boolean;
};

type Row = { id: number };

function HeaderInput(props: {
  value: string;
  disabled: boolean;
  hasError: boolean;
  isActive: boolean;
  title?: string;
  onFocus?: () => void;
  onChange: (next: string) => void;
}) {
  const { value, disabled, hasError, title, onFocus, onChange } = props;

  return (
    <input
      value={value}
      placeholder="Click to add header"
      onFocus={onFocus}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      aria-invalid={hasError ? 'true' : 'false'}
      title={title}
      style={{
        width: '100%',
        border: 'none',
        padding: '10px 8px',
        fontSize: 13,
        outline: 'none',
        background: 'transparent',
        borderRadius: 6,
        boxShadow: hasError ? 'inset 0 0 0 2px rgba(220, 38, 38, 0.55)' : undefined,
      }}
    />
  );
}

export const TabularHeadingsTable: React.FC<TabularHeadingsTableProps> = props => {
  const {
    columns,
    headings,
    tooltips = [],
    onChangeHeadings,
    visibleRows = 8,
    activeColumn = 0,
    onActiveColumnChange,
    issues = [],
    disabled = false,
  } = props;

  const safeHeadings = useMemo(() => Array.from({ length: columns }, (_, i) => headings[i] ?? ''), [columns, headings]);
  const safeTooltips = useMemo(() => Array.from({ length: columns }, (_, i) => tooltips[i] ?? ''), [columns, tooltips]);

  const issuesByColumn = useMemo(() => {
    const map = new Map<number, TabularValidationIssue[]>();
    for (const issue of issues) {
      if (issue.columnIndex == null) continue;
      map.set(issue.columnIndex, [...(map.get(issue.columnIndex) ?? []), issue]);
    }
    return map;
  }, [issues]);

  const rows = useMemo<Row[]>(
    () => Array.from({ length: Math.max(0, visibleRows) }, (_, i) => ({ id: i })),
    [visibleRows]
  );

  const gridColumns = useMemo<readonly Column<Row>[]>(() => {
    return Array.from({ length: columns }, (_, c) => {
      const cellIssues = issuesByColumn.get(c) ?? [];
      const hasError = cellIssues.length > 0;
      const issueTitle = cellIssues[0]?.message;
      const tooltipTitle = (safeTooltips[c] ?? '').trim();
      const title =
        issueTitle && tooltipTitle ? `${issueTitle}\n${tooltipTitle}` : (issueTitle ?? (tooltipTitle || undefined));

      return {
        key: `c-${c}`,
        name: '',
        width: 220,
        resizable: false,
        sortable: false,
        renderHeaderCell: () => (
          <div
            role="button"
            tabIndex={0}
            title={title}
            onMouseDown={() => onActiveColumnChange?.(c)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') onActiveColumnChange?.(c);
            }}
            style={{
              height: '100%',
              padding: 0,
              background: c === activeColumn ? '#eef6ff' : '#f3f6ff',
              cursor: 'pointer',
            }}
          >
            <HeaderInput
              value={safeHeadings[c] ?? ''}
              disabled={disabled}
              hasError={hasError}
              isActive={c === activeColumn}
              title={title}
              onFocus={() => onActiveColumnChange?.(c)}
              onChange={next => {
                const copy = safeHeadings.slice();
                copy[c] = next;
                onChangeHeadings(copy);
              }}
            />
          </div>
        ),
        renderCell: () => (
          <div
            aria-disabled="true"
            style={{
              height: '100%',
              background: '#fafafa',
            }}
          />
        ),
      } satisfies Column<Row>;
    });
  }, [
    columns,
    safeHeadings,
    safeTooltips,
    disabled,
    issuesByColumn,
    activeColumn,
    onActiveColumnChange,
    onChangeHeadings,
  ]);

  const headerRowHeight = 54;
  const rowHeight = 42;
  const gridHeight = headerRowHeight + rowHeight * rows.length + 2;
  const minGridWidth = columns * 220 + 2;

  return (
    <>
      <style>
        {`
          .tabular-rdg .rdg-cell[aria-selected="true"] {
            outline: none !important;
          }
          .tabular-rdg .rdg-cell {
            border-inline-end: 1px solid #d4d8df !important;
            border-block-end: 1px solid #d4d8df !important;
          }
        `}
      </style>
      <DataGrid
        className="rdg-light tabular-rdg"
        columns={gridColumns}
        rows={rows}
        rowKeyGetter={r => r.id}
        enableVirtualization={false}
        headerRowHeight={headerRowHeight}
        rowHeight={rowHeight}
        style={{
          height: gridHeight,
          minWidth: minGridWidth,
          border: '1px solid #d4d8df',
          ['--rdg-selection-width' as string]: '0px',
          ['--rdg-border-color' as string]: '#d4d8df',
        }}
      />
    </>
  );
};
