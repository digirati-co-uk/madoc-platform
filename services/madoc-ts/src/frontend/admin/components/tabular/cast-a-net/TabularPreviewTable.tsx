import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataGrid, type Column } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import type { TabularCellRef } from './types';
import {
  TABULAR_COLUMN_MIN_WIDTH_PX,
  TABULAR_GRID_HEADER_ROW_HEIGHT_PX,
  TABULAR_GRID_ROW_HEIGHT_PX,
} from '@/frontend/shared/utility/tabular-grid-constants';
import { TabularDataGridStyles } from '@/frontend/shared/components/TabularDataGridStyles';
import { Button } from '@/frontend/shared/navigation/Button';

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
  onRemoveRow?: () => void;
  canRemoveRow?: boolean;
  addRowLabel?: string;
  removeRowLabel?: string;
  containerHeight?: number | string;
  containerWidth?: number | string;
};

type PreviewRow = { id: number };

function getPreviewInputId(rowIndex: number, colIndex: number) {
  return `tabular-preview-row-${rowIndex}-col-${colIndex}`;
}

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
  onRemoveRow,
  canRemoveRow = true,
  addRowLabel = '+ Add row',
  removeRowLabel = 'Remove row -',
  containerHeight,
  containerWidth,
}: TabularPreviewTableProps) {
  const safeColumns = Math.max(1, headings.length || 0);
  const safeRows = Math.max(1, rows || 0);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollToNewRowRef = useRef(false);
  const [tableViewportWidth, setTableViewportWidth] = useState(0);

  useEffect(() => {
    const container = tableScrollRef.current;
    if (!container) {
      return;
    }

    const updateWidth = () => {
      setTableViewportWidth(Math.floor(container.clientWidth));
    };
    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateWidth();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

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

  const focusGridInput = useCallback(
    (rowIndex: number, colIndex: number, caretPosition: 'start' | 'end' = 'end') => {
      if (rowIndex < 0 || rowIndex >= safeRows || colIndex < 0 || colIndex >= safeColumns) {
        return false;
      }

      onActiveCellChange({ row: rowIndex, col: colIndex });

      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          const input = document.getElementById(getPreviewInputId(rowIndex, colIndex)) as HTMLInputElement | null;
          if (!input) {
            return;
          }

          input.focus();
          if (typeof input.setSelectionRange === 'function') {
            const caret = caretPosition === 'start' ? 0 : input.value.length;
            input.setSelectionRange(caret, caret);
          }
          input.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        });
      }

      return true;
    },
    [onActiveCellChange, safeColumns, safeRows]
  );

  useEffect(() => {
    if (!shouldScrollToNewRowRef.current) {
      return;
    }
    shouldScrollToNewRowRef.current = false;

    const lastRowIndex = safeRows - 1;
    if (lastRowIndex < 0) {
      return;
    }

    const container = tableScrollRef.current;
    if (container) {
      const viewport = container.querySelector('.rdg-viewport') as HTMLDivElement | null;
      const scrollTarget = viewport || container;
      scrollTarget.scrollTo({ top: scrollTarget.scrollHeight, behavior: 'smooth' });
    }

    focusGridInput(lastRowIndex, 0, 'start');
  }, [focusGridInput, safeRows]);

  const handleAddRow = useCallback(() => {
    if (!onAddRow || disabled) {
      return;
    }

    shouldScrollToNewRowRef.current = true;
    onAddRow();
  }, [disabled, onAddRow]);

  const columnWidth = useMemo(() => {
    if (tableViewportWidth <= 0) {
      return TABULAR_COLUMN_MIN_WIDTH_PX;
    }

    const availableWidth = Math.max(0, tableViewportWidth - 2);
    const stretchedWidth = Math.floor(availableWidth / safeColumns);
    return Math.max(TABULAR_COLUMN_MIN_WIDTH_PX, stretchedWidth);
  }, [safeColumns, tableViewportWidth]);

  const gridColumns = useMemo<readonly Column<PreviewRow>[]>(() => {
    return Array.from({ length: safeColumns }, (_unused, colIndex) => {
      const heading = safeHeadings[colIndex] ?? '';
      const tooltip = safeTooltips[colIndex] ?? '';
      const title = tooltip || undefined;

      return {
        key: `c-${colIndex}`,
        name: '',
        width: columnWidth,
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
          const lastColIndex = safeColumns - 1;
          const lastRowIndex = safeRows - 1;

          const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.altKey || event.ctrlKey || event.metaKey) {
              return;
            }

            if (event.key === 'Tab') {
              let nextRow = rowIndex;
              let nextCol = colIndex + (event.shiftKey ? -1 : 1);

              if (nextCol < 0) {
                nextRow -= 1;
                nextCol = lastColIndex;
              } else if (nextCol > lastColIndex) {
                nextRow += 1;
                nextCol = 0;
              }

              if (nextRow < 0 || nextRow > lastRowIndex) {
                return;
              }

              event.preventDefault();
              event.stopPropagation();
              focusGridInput(nextRow, nextCol, event.shiftKey ? 'end' : 'start');
              return;
            }

            if (event.key === 'ArrowUp') {
              const nextRow = rowIndex - 1;
              if (nextRow < 0) {
                return;
              }

              event.preventDefault();
              event.stopPropagation();
              focusGridInput(nextRow, colIndex, 'end');
              return;
            }

            if (event.key === 'ArrowDown') {
              const nextRow = rowIndex + 1;
              if (nextRow > lastRowIndex) {
                return;
              }

              event.preventDefault();
              event.stopPropagation();
              focusGridInput(nextRow, colIndex, 'end');
              return;
            }

            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
              return;
            }

            const moveLeft = event.key === 'ArrowLeft';
            const nextCol = colIndex + (moveLeft ? -1 : 1);
            if (nextCol < 0 || nextCol > lastColIndex) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            focusGridInput(rowIndex, nextCol, moveLeft ? 'end' : 'start');
          };

          return (
            <div
              onMouseDown={() => {
                focusGridInput(rowIndex, colIndex, 'end');
              }}
              style={{
                height: '100%',
                background: isActiveCell ? '#def3e4' : isActiveRow ? '#f2fbf4' : '#fff',
              }}
            >
              {isActiveCell ? (
                <input
                  id={getPreviewInputId(rowIndex, colIndex)}
                  value={value}
                  disabled={disabled}
                  onFocus={() => onActiveCellChange({ row: rowIndex, col: colIndex })}
                  onKeyDown={handleKeyDown}
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
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'transparent',
                    padding: '10px 12px',
                    fontSize: 13,
                    lineHeight: '20px',
                    whiteSpace: 'normal',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                  }}
                  title={value || undefined}
                >
                  {value || '\u00A0'}
                </div>
              )}
            </div>
          );
        },
      } satisfies Column<PreviewRow>;
    });
  }, [
    activeCell,
    columnWidth,
    disabled,
    focusGridInput,
    onActiveCellChange,
    safeColumns,
    safeHeadings,
    safeRows,
    safeTooltips,
    safeValues,
    updateCell,
  ]);

  const headerRowHeight = TABULAR_GRID_HEADER_ROW_HEIGHT_PX;
  const rowHeight = Math.max(TABULAR_GRID_ROW_HEIGHT_PX, 60);
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
      <TabularDataGridStyles scopeClassName="tabular-preview-rdg" disableRowHover />
      <div
        ref={tableScrollRef}
        style={{ flex: hasFixedHeight ? '1 1 auto' : undefined, minHeight: 0, overflow: 'hidden' }}
      >
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
            width: '100%',
            border: 'none',
            ['--rdg-selection-width' as string]: '0px',
            ['--rdg-border-color' as string]: '#d6d6d6',
          }}
        />
      </div>
      {onAddRow || onRemoveRow ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            padding: '8px 10px',
            borderTop: '1px solid #d6d6d6',
            background: '#f1f5f9',
            flex: '0 0 auto',
          }}
        >
          {onRemoveRow ? (
            <Button
              $error
              type="button"
              onClick={onRemoveRow}
              disabled={disabled || !canRemoveRow}
              className="!min-w-28 justify-center !px-3 !py-1 !text-xs !rounded-md font-semibold shadow-sm"
            >
              {removeRowLabel}
            </Button>
          ) : null}
          {onAddRow ? (
            <Button
              $primary
              type="button"
              onClick={handleAddRow}
              disabled={disabled}
              className="!min-w-28 justify-center !px-3 !py-1 !text-xs !rounded-md font-semibold shadow-sm"
            >
              {addRowLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
