import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataGrid, type Column } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import type { TabularCellRef } from '@/frontend/shared/utility/tabular-types';
import { Button } from '@/frontend/shared/navigation/Button';
import {
  TABULAR_COLUMN_MIN_WIDTH_PX,
  TABULAR_GRID_HEADER_ROW_HEIGHT_PX,
  TABULAR_GRID_ROW_HEIGHT_PX,
} from '@/frontend/shared/utility/tabular-grid-constants';
import { getTabularGridKeyboardNavigation } from '@/frontend/shared/utility/tabular-grid-keyboard-navigation';
import { TabularDataGridStyles } from '@/frontend/shared/components/TabularDataGridStyles';
import FlagIcon from '@/frontend/shared/icons/FlagIcon';
import type { TabularEditorHeaderModel, TabularEditorRowModel } from './tabular-project-custom-editor-table-model';

type TabularProjectCustomEditorTableProps = {
  headerColumns: TabularEditorHeaderModel[];
  rows: TabularEditorRowModel[];
  showEmptyState: boolean;
  showRowControls?: boolean;
  showAddRowControl?: boolean;
  showRemoveRowControl?: boolean;
  addRowLabel?: string;
  removeRowLabel?: string;
  footerActions?: React.ReactNode;
  tableActiveCell: TabularCellRef | null;
  onActiveCellChange: (next: TabularCellRef | null) => void;
  disabled: boolean;
  canAddRow: boolean;
  canRemoveRow: boolean;
  addRowFromFooter: () => void;
  removeRowFromFooter: () => void;
  isCellFlagged: (rowIndex: number, columnKey: string) => boolean;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
};

type TabularGridRow = {
  id: string;
  rowIndex: number;
  rowPosition: number;
  row: TabularEditorRowModel;
};

function FlaggedCellBadge() {
  return (
    <span
      className="absolute right-2 top-2 rounded border border-red-300 bg-red-100 px-1 text-[10px] font-semibold leading-4 text-red-700"
      title="Flagged for review"
    >
      <FlagIcon className="h-3 w-3" />
    </span>
  );
}

function toTextValue(value: unknown) {
  return typeof value === 'string' ? value : value === null || typeof value === 'undefined' ? '' : String(value);
}

function joinClasses(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

type TabularGridCellInputProps = {
  inputId: string;
  value: unknown;
  fieldType?: string;
  disabled: boolean;
  onChange: (nextValue: unknown) => void;
  onFocus: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  isActiveCell: boolean;
  isFlagged: boolean;
};

function TabularGridCellInput(options: TabularGridCellInputProps) {
  const { inputId, value, fieldType, disabled, onChange, onFocus, onKeyDown, isActiveCell, isFlagged } = options;
  const [optimisticTextValue, setOptimisticTextValue] = useState<string>(() => toTextValue(value));
  const [optimisticCheckedValue, setOptimisticCheckedValue] = useState<boolean>(() => !!value);

  const inputContainerClass = isActiveCell
    ? 'border-[#34a853] bg-[#def3e4]'
    : isFlagged
      ? 'border-red-300 bg-red-50'
      : 'border-transparent bg-transparent';

  useEffect(() => {
    if (fieldType === 'checkbox-field') {
      setOptimisticCheckedValue(!!value);
      return;
    }

    setOptimisticTextValue(toTextValue(value));
  }, [fieldType, inputId, value]);

  if (fieldType === 'checkbox-field') {
    return (
      <div className={`flex h-full items-center justify-center rounded border px-2 py-1 ${inputContainerClass}`}>
        <input
          id={inputId}
          type="checkbox"
          checked={optimisticCheckedValue}
          aria-disabled={disabled}
          onFocus={onFocus}
          onClick={onFocus}
          onKeyDown={onKeyDown}
          onChange={event => {
            if (disabled) {
              return;
            }
            const nextValue = event.target.checked;
            setOptimisticCheckedValue(nextValue);
            onChange(nextValue);
          }}
        />
      </div>
    );
  }

  if (!isActiveCell) {
    return (
      <div
        className={`h-full w-full rounded border px-2 py-1 text-sm leading-5 ${inputContainerClass}`}
        style={{
          whiteSpace: 'normal',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
          overflow: 'hidden',
        }}
        title={optimisticTextValue || undefined}
      >
        {optimisticTextValue || '\u00A0'}
      </div>
    );
  }

  return (
    <input
      id={inputId}
      className={`h-full w-full rounded border px-2 py-1 text-sm outline-none ${inputContainerClass}`}
      value={optimisticTextValue}
      readOnly={disabled}
      aria-readonly={disabled}
      onFocus={onFocus}
      onClick={onFocus}
      onKeyDown={onKeyDown}
      onChange={event => {
        if (disabled) {
          return;
        }
        const nextValue = event.currentTarget.value;
        setOptimisticTextValue(nextValue);
        onChange(nextValue);
      }}
    />
  );
}

export function TabularProjectCustomEditorTable({
  headerColumns,
  rows,
  showEmptyState,
  showRowControls = true,
  showAddRowControl = true,
  showRemoveRowControl = true,
  addRowLabel = 'Add new row +',
  removeRowLabel = 'Remove row -',
  footerActions,
  tableActiveCell,
  onActiveCellChange,
  disabled,
  canAddRow,
  canRemoveRow,
  addRowFromFooter,
  removeRowFromFooter,
  isCellFlagged,
  containerClassName,
  containerStyle,
}: TabularProjectCustomEditorTableProps) {
  const isRemoveRowDisabled = disabled || !canRemoveRow;
  const isAddRowDisabled = disabled || !canAddRow;
  const hasAnyRowControl = showRowControls && (showAddRowControl || showRemoveRowControl);
  const hasFooterActions = !!footerActions;
  const footerJustifyClass =
    hasAnyRowControl && hasFooterActions ? 'justify-between' : hasFooterActions ? 'justify-end' : 'justify-center';
  const headerRowHeight = TABULAR_GRID_HEADER_ROW_HEIGHT_PX;
  const rowHeight = Math.max(TABULAR_GRID_ROW_HEIGHT_PX, 60);
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

  const gridRows = useMemo<readonly TabularGridRow[]>(
    () =>
      rows.map((row, rowPosition) => ({
        id: row.key,
        rowIndex: row.rowIndex,
        rowPosition,
        row,
      })),
    [rows]
  );

  const focusGridInput = useCallback(
    (rowPosition: number, colIndex: number, caretPosition: 'start' | 'end' = 'end') => {
      const targetRow = gridRows[rowPosition];
      const targetCell = targetRow?.row.cells[colIndex];
      if (!targetCell) {
        return false;
      }

      onActiveCellChange({ row: targetCell.rowIndex, col: colIndex });
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          const input = document.getElementById(targetCell.inputId) as HTMLInputElement | null;
          if (!input) {
            return;
          }

          input.focus();
          if (input.type !== 'checkbox' && typeof input.setSelectionRange === 'function') {
            const caret = caretPosition === 'start' ? 0 : input.value.length;
            input.setSelectionRange(caret, caret);
          }
          input.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        });
      }

      return true;
    },
    [gridRows, onActiveCellChange]
  );

  const columnWidth = useMemo(() => {
    const visibleColumns = Math.max(1, headerColumns.length);
    if (tableViewportWidth <= 0) {
      return TABULAR_COLUMN_MIN_WIDTH_PX;
    }

    const availableWidth = Math.max(0, tableViewportWidth - 2);
    const stretchedWidth = Math.floor(availableWidth / visibleColumns);
    return Math.max(TABULAR_COLUMN_MIN_WIDTH_PX, stretchedWidth);
  }, [headerColumns.length, tableViewportWidth]);

  const gridColumns = useMemo<readonly Column<TabularGridRow>[]>(() => {
    return headerColumns.map((column, colIndex) => {
      return {
        key: column.key,
        name: '',
        width: columnWidth,
        sortable: false,
        resizable: false,
        renderHeaderCell: () => {
          const isActiveColumn = tableActiveCell?.col === colIndex;
          const tooltip = column.description?.trim() || undefined;

          return (
            <div
              title={tooltip}
              style={{
                height: '100%',
                background: isActiveColumn ? '#b9c8f5' : '#d9deee',
                boxShadow: isActiveColumn ? 'inset 0 0 0 2px #8aa3ea' : undefined,
                color: '#283452',
                display: 'grid',
                alignContent: 'center',
                padding: '8px 10px',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>{column.label}</div>
            </div>
          );
        },
        renderCell: ({ row }) => {
          const cell = row.row.cells[colIndex];
          if (!cell) {
            return <div />;
          }

          const isActiveRow = tableActiveCell?.row === cell.rowIndex;
          const isActiveCell = isActiveRow && tableActiveCell?.col === colIndex;
          const isFlagged = isCellFlagged(cell.rowIndex, cell.columnKey);

          const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
            const navigation = getTabularGridKeyboardNavigation({
              key: event.key,
              shiftKey: event.shiftKey,
              altKey: event.altKey,
              ctrlKey: event.ctrlKey,
              metaKey: event.metaKey,
              rowIndex: row.rowPosition,
              colIndex,
              rowCount: gridRows.length,
              colCount: headerColumns.length,
              inputType: event.currentTarget.type,
              selectionStart: event.currentTarget.selectionStart,
              selectionEnd: event.currentTarget.selectionEnd,
              valueLength: event.currentTarget.value.length,
              horizontalArrowBehavior: 'always',
            });

            if (!navigation) {
              const isDirectionalArrowKey =
                event.key === 'ArrowUp' ||
                event.key === 'ArrowDown' ||
                event.key === 'ArrowLeft' ||
                event.key === 'ArrowRight';

              // Without this, react-data-grid can intercept the event and trap keyboard navigation.
              if (isDirectionalArrowKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
                event.preventDefault();
                event.stopPropagation();
              }
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            focusGridInput(navigation.nextRow, navigation.nextCol, navigation.caretPosition);
          };

          return (
            <div
              id={cell.cellElementId}
              onMouseDown={() => {
                focusGridInput(row.rowPosition, colIndex, 'end');
              }}
              style={{
                height: '100%',
                padding: 4,
                position: 'relative',
                background: isActiveCell ? '#def3e4' : isFlagged ? '#fef2f2' : isActiveRow ? '#f2fbf4' : '#fff',
              }}
            >
              {isFlagged ? <FlaggedCellBadge /> : null}
              <TabularGridCellInput
                inputId={cell.inputId}
                value={cell.value}
                fieldType={cell.fieldType}
                disabled={disabled}
                onFocus={() => onActiveCellChange({ row: cell.rowIndex, col: colIndex })}
                onKeyDown={handleKeyDown}
                isActiveCell={isActiveCell}
                isFlagged={isFlagged}
                onChange={cell.onChange}
              />
            </div>
          );
        },
      } satisfies Column<TabularGridRow>;
    });
  }, [
    columnWidth,
    disabled,
    focusGridInput,
    gridRows.length,
    headerColumns,
    isCellFlagged,
    onActiveCellChange,
    tableActiveCell,
  ]);

  useEffect(() => {
    if (!shouldScrollToNewRowRef.current) {
      return;
    }
    shouldScrollToNewRowRef.current = false;

    const lastRowPosition = gridRows.length - 1;
    if (lastRowPosition < 0) {
      return;
    }

    const container = tableScrollRef.current;
    if (container) {
      const viewport = container.querySelector('.rdg-viewport') as HTMLDivElement | null;
      const scrollTarget = viewport || container;
      scrollTarget.scrollTo({ top: scrollTarget.scrollHeight, behavior: 'smooth' });
    }

    if (headerColumns.length > 0) {
      focusGridInput(lastRowPosition, 0, 'start');
    }
  }, [focusGridInput, gridRows.length, headerColumns.length]);

  const handleAddRowFromFooter = useCallback(() => {
    if (isAddRowDisabled) {
      return;
    }

    shouldScrollToNewRowRef.current = true;
    addRowFromFooter();
  }, [addRowFromFooter, isAddRowDisabled]);

  return (
    <div
      className={joinClasses(
        'flex min-h-0 min-w-0 flex-col overflow-hidden rounded border border-[#d6d6d6] bg-white',
        containerClassName
      )}
      style={containerStyle}
    >
      <TabularDataGridStyles scopeClassName="tabular-contributor-rdg" disableRowHover />
      <div ref={tableScrollRef} className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <DataGrid
          className="rdg-light tabular-contributor-rdg"
          columns={gridColumns}
          rows={gridRows}
          rowKeyGetter={row => row.id}
          enableVirtualization={false}
          headerRowHeight={headerRowHeight}
          rowHeight={rowHeight}
          style={{
            height: '100%',
            width: '100%',
            border: 'none',
            ['--rdg-selection-width' as string]: '0px',
            ['--rdg-border-color' as string]: '#d6d6d6',
          }}
        />
      </div>
      {showEmptyState ? (
        <div className="border-t border-[#d6d6d6] px-3 py-6 text-center text-sm text-gray-600">
          No rows yet. Use + to create the first row.
        </div>
      ) : null}
      {hasAnyRowControl || hasFooterActions ? (
        <div
          className={`flex flex-none items-center gap-2 border-t border-[#d6d6d6] bg-[#f1f5f9] px-3 py-2 ${footerJustifyClass}`}
        >
          {hasAnyRowControl ? (
            <div className="flex items-center justify-center gap-2">
              {showRemoveRowControl ? (
                <Button
                  $error
                  type="button"
                  onClick={removeRowFromFooter}
                  disabled={isRemoveRowDisabled}
                  title="Remove row"
                  className="!min-w-28 justify-center !px-3 !py-1 !text-xs !rounded-md font-semibold shadow-sm"
                >
                  {removeRowLabel}
                </Button>
              ) : null}
              {showAddRowControl ? (
                <Button
                  $primary
                  type="button"
                  onClick={handleAddRowFromFooter}
                  disabled={isAddRowDisabled}
                  title="Add new row"
                  className="!min-w-28 justify-center !px-3 !py-1 !text-xs !rounded-md font-semibold shadow-sm"
                >
                  {addRowLabel}
                </Button>
              ) : null}
            </div>
          ) : null}
          {hasFooterActions ? <div className="flex items-center gap-2">{footerActions}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
