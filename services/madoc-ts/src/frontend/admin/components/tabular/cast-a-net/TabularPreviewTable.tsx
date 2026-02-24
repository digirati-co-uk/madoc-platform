import { useCallback, useMemo } from 'react';
import { DataGrid, type Column } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import type { TabularCellRef } from './types';

export type TabularPreviewTableProps = {
  headings: string[];
  tooltips?: (string | undefined)[];
  rows: number;
  values: string[][];
  onChange: (next: string[][]) => void;
  activeCell: TabularCellRef | null;
  onActiveCellChange: (next: TabularCellRef | null) => void;
  disabled?: boolean;
  onAddRow?: () => void;
  addRowLabel?: string;
  containerHeight?: number | string;
  containerWidth?: number | string;
};

type PreviewRow = { id: number };

export function TabularPreviewTable({
  headings,
  tooltips = [],
  rows,
  values,
  onChange,
  activeCell,
  onActiveCellChange,
  disabled = false,
  onAddRow,
  addRowLabel = '+ Add row',
  containerHeight,
  containerWidth,
}: TabularPreviewTableProps) {
  const safeColumns = Math.max(1, headings.length || 0);
  const safeRows = Math.max(1, rows || 0);

  const safeHeadings = useMemo(
    () =>
      Array.from({ length: safeColumns }, (_, index) => {
        const value = (headings[index] || '').trim();
        return value || `Column ${index + 1}`;
      }),
    [headings, safeColumns]
  );
  const safeTooltips = useMemo(
    () => Array.from({ length: safeColumns }, (_, index) => (tooltips[index] || '').trim()),
    [tooltips, safeColumns]
  );

  const safeValues = useMemo(
    () =>
      Array.from({ length: safeRows }, (_row, rowIndex) =>
        Array.from({ length: safeColumns }, (_col, colIndex) => values[rowIndex]?.[colIndex] ?? '')
      ),
    [values, safeRows, safeColumns]
  );

  const rowsForGrid = useMemo<PreviewRow[]>(
    () => Array.from({ length: safeRows }, (_row, rowIndex) => ({ id: rowIndex })),
    [safeRows]
  );

  const updateCell = useCallback(
    (rowIndex: number, colIndex: number, nextValue: string) => {
      const nextRows = safeValues.map(row => row.slice());
      nextRows[rowIndex][colIndex] = nextValue;
      onChange(nextRows);
    },
    [onChange, safeValues]
  );

  const gridColumns = useMemo<readonly Column<PreviewRow>[]>(() => {
    return Array.from({ length: safeColumns }, (_unused, colIndex) => {
      const heading = safeHeadings[colIndex] ?? '';
      const tooltip = safeTooltips[colIndex] ?? '';
      const title = tooltip ? `${heading}\n${tooltip}` : heading;

      return {
        key: `c-${colIndex}`,
        name: '',
        width: 220,
        sortable: false,
        resizable: false,
        renderHeaderCell: () => (
          <div
            style={{
              height: '100%',
              background: '#d9deee',
              color: '#283452',
              fontSize: 13,
              fontWeight: 500,
              padding: '8px 10px',
              textAlign: 'center',
              display: 'grid',
              alignItems: 'center',
            }}
            title={title}
          >
            <div style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{heading}</div>
          </div>
        ),
        renderCell: ({ row }) => {
          const rowIndex = row.id;
          const value = safeValues[rowIndex]?.[colIndex] ?? '';
          const isActiveRow = activeCell?.row === rowIndex;
          const isActiveCell = isActiveRow && activeCell?.col === colIndex;

          return (
            <div
              style={{
                height: '100%',
                background: isActiveCell ? '#def3e4' : isActiveRow ? '#f2fbf4' : '#fff',
              }}
            >
              <input
                value={value}
                disabled={disabled}
                onFocus={() => onActiveCellChange({ row: rowIndex, col: colIndex })}
                onChange={event => updateCell(rowIndex, colIndex, event.currentTarget.value)}
                style={{
                  border: 'none',
                  width: '100%',
                  height: '100%',
                  background: 'transparent',
                  padding: '10px 12px',
                  fontSize: 13,
                  outline: isActiveCell ? '2px solid #34a853' : 'none',
                  outlineOffset: -2,
                }}
              />
            </div>
          );
        },
      } satisfies Column<PreviewRow>;
    });
  }, [activeCell, disabled, onActiveCellChange, safeColumns, safeHeadings, safeTooltips, safeValues, updateCell]);

  const headerRowHeight = 52;
  const rowHeight = 46;
  const gridHeight = headerRowHeight + rowHeight * safeRows + 2;
  const hasFixedHeight = typeof containerHeight !== 'undefined';

  return (
    <div
      style={{
        border: '1px solid #d6d6d6',
        background: '#fff',
        height: containerHeight,
        width: containerWidth || '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <style>
        {`
          .tabular-preview-rdg .rdg-cell[aria-selected="true"] {
            outline: none !important;
          }
          .tabular-preview-rdg .rdg-cell {
            border-inline-end: 1px solid #d6d6d6 !important;
            border-block-end: 1px solid #d6d6d6 !important;
            padding: 0 !important;
          }
          .tabular-preview-rdg .rdg-header-row .rdg-cell {
            padding: 0 !important;
          }
          .tabular-preview-rdg .rdg-row:hover {
            background: inherit !important;
          }
        `}
      </style>
      <div style={{ flex: hasFixedHeight ? '1 1 auto' : undefined, minHeight: 0 }}>
        <DataGrid
          className="rdg-light tabular-preview-rdg"
          columns={gridColumns}
          rows={rowsForGrid}
          rowKeyGetter={row => row.id}
          enableVirtualization={false}
          headerRowHeight={headerRowHeight}
          rowHeight={rowHeight}
          style={{
            height: hasFixedHeight ? '100%' : gridHeight,
            minWidth: safeColumns * 220 + 2,
            border: 'none',
            ['--rdg-selection-width' as string]: '0px',
            ['--rdg-border-color' as string]: '#d6d6d6',
          }}
        />
      </div>
      {onAddRow ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '8px 10px',
            borderTop: '1px solid #d6d6d6',
            background: '#f8fafc',
            flex: '0 0 auto',
          }}
        >
          <button
            type="button"
            onClick={onAddRow}
            disabled={disabled}
            style={{
              border: '1px solid #cfd6e5',
              background: '#fff',
              borderRadius: 4,
              color: '#1f2d5a',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: 12,
              padding: '6px 10px',
            }}
          >
            {addRowLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
