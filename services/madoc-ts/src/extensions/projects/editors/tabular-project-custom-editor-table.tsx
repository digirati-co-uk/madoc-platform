import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataGrid, type Column, type DataGridHandle } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import type { TabularCellRef } from '@/frontend/shared/utility/tabular-types';
import { Button } from '@/frontend/shared/navigation/Button';
import {
  TABULAR_COLUMN_MIN_WIDTH_PX,
  TABULAR_GRID_HEADER_ROW_HEIGHT_PX,
  TABULAR_GRID_ROW_HEIGHT_PX,
} from '@/frontend/shared/utility/tabular-grid-constants';
import {
  copyTabularCellValueToClipboard,
  getInputCopyValue,
  isTabularCopyShortcut,
  shouldCopyWholeInputValue,
} from '@/frontend/shared/utility/tabular-grid-clipboard';
import {
  getTabularGridKeyboardNavigation,
  isDirectionalArrowKey,
  isForwardTabWithoutModifiers,
} from '@/frontend/shared/utility/tabular-grid-keyboard-navigation';
import { TabularDataGridStyles } from '@/frontend/shared/components/TabularDataGridStyles';
import { scrollTabularGridCellIntoView } from '@/frontend/shared/utility/tabular-grid-scroll';
import { formatDateFieldInput, isValidDateFieldValue } from '@/frontend/shared/utility/date-field-format';
import FlagIcon from '@/frontend/shared/icons/FlagIcon';
import type { TabularEditorHeaderModel, TabularEditorRowModel } from './tabular-project-custom-editor-table-model';

type TabularProjectCustomEditorTableProps = {
  headerColumns: TabularEditorHeaderModel[];
  rows: TabularEditorRowModel[];
  showEmptyState: boolean;
  showRowControls?: boolean;
  rowControlsAlignment?: 'center' | 'start';
  showAddRowControl?: boolean;
  showRemoveRowControl?: boolean;
  addRowLabel?: string;
  removeRowLabel?: string;
  tableActions?: React.ReactNode;
  tableActiveCell: TabularCellRef | null;
  onActiveCellChange: (next: TabularCellRef | null) => void;
  disabled: boolean;
  canAddRow: boolean;
  canRemoveRow: boolean;
  addRowFromFooter: () => void;
  removeRowFromFooter: () => void;
  isCellFlagged: (rowIndex: number, columnKey: string) => boolean;
  enableCellFlagQuickActions?: boolean;
  canToggleCellFlags?: boolean;
  onToggleCellFlag?: (rowIndex: number, columnKey: string) => void;
  onOpenCellReviewPanel?: (next: TabularCellRef) => void;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
};

type TabularGridRow = {
  id: string;
  rowIndex: number;
  rowPosition: number;
  row: TabularEditorRowModel;
};

type FlagCellButtonProps = {
  isFlagged: boolean;
  alwaysVisible: boolean;
  disabled: boolean;
  onToggle: () => void;
};

function FlagCellButton({ isFlagged, alwaysVisible, disabled, onToggle }: FlagCellButtonProps) {
  const variantClasses = isFlagged
    ? 'border-red-300 bg-red-100 text-red-700'
    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50';
  const visibilityClasses = alwaysVisible
    ? 'pointer-events-auto opacity-100'
    : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100';

  return (
    <button
      type="button"
      className={`absolute right-2 top-2 z-[1] inline-flex h-6 w-6 items-center justify-center rounded border text-xs transition ${variantClasses} ${visibilityClasses} disabled:cursor-not-allowed disabled:opacity-60`}
      title={isFlagged ? 'Clear flag' : 'Flag cell for review'}
      aria-label={isFlagged ? 'Clear flag' : 'Flag cell for review'}
      disabled={disabled}
      onMouseDown={event => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        if (disabled) {
          return;
        }
        onToggle();
      }}
    >
      <FlagIcon className="h-3 w-3" />
    </button>
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
  fieldOptions?: Array<{ value: string; text: string; label?: string }>;
  disabled: boolean;
  onChange: (nextValue: unknown) => void;
  onFocus: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isActiveCell: boolean;
  isFlagged: boolean;
};

type TabularCellContextMenuState = {
  x: number;
  y: number;
  rowIndex: number;
  colIndex: number;
  columnKey: string;
  isFlagged: boolean;
};

function getDropdownDisplayText(
  options: Array<{ value: string; text: string; label?: string }>,
  selectedValue: string
): string {
  const selectedOption = options.find(option => option.value === selectedValue);
  return selectedOption?.text || selectedOption?.label || selectedValue;
}

function TabularGridCellInput(options: TabularGridCellInputProps) {
  const { inputId, value, fieldType, fieldOptions, disabled, onChange, onFocus, onKeyDown, isActiveCell, isFlagged } =
    options;
  const [optimisticTextValue, setOptimisticTextValue] = useState<string>(() => toTextValue(value));
  const [optimisticCheckedValue, setOptimisticCheckedValue] = useState<boolean>(() => !!value);

  const inputContainerClass = isActiveCell
    ? 'border-[#34a853] bg-[#def3e4]'
    : isFlagged
      ? 'border-red-300 bg-red-50'
      : 'border-transparent bg-transparent';

  const isCheckboxField = fieldType === 'checkbox-field';
  const isDateField = fieldType === 'date-field';
  const isDropdownField = fieldType === 'dropdown-field';
  const isInvalidDateValue = isDateField && !isValidDateFieldValue(optimisticTextValue);
  const invalidDateClasses = isInvalidDateValue ? 'border-red-400 bg-red-50' : undefined;
  const dropdownOptions = fieldOptions ?? [];
  const displayTextValue = isDropdownField
    ? getDropdownDisplayText(dropdownOptions, optimisticTextValue)
    : optimisticTextValue;

  useEffect(() => {
    if (isCheckboxField) {
      setOptimisticCheckedValue(!!value);
      return;
    }

    const nextTextValue = toTextValue(value);
    setOptimisticTextValue(isDateField ? formatDateFieldInput(nextTextValue) : nextTextValue);
  }, [inputId, isCheckboxField, isDateField, value]);

  const commitTextValue = (nextTextValue: string) => {
    setOptimisticTextValue(nextTextValue);
    onChange(nextTextValue);
  };
  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }
    const nextRawValue = event.currentTarget.value;
    commitTextValue(isDateField ? formatDateFieldInput(nextRawValue) : nextRawValue);
  };

  if (isCheckboxField) {
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
        title={displayTextValue || undefined}
      >
        {displayTextValue || '\u00A0'}
      </div>
    );
  }

  if (isDropdownField) {
    return (
      <select
        id={inputId}
        className={`h-full w-full rounded border px-2 py-1 text-sm outline-none ${inputContainerClass}`}
        value={optimisticTextValue}
        disabled={disabled}
        aria-disabled={disabled}
        onFocus={onFocus}
        onClick={onFocus}
        onKeyDown={onKeyDown}
        onChange={event => {
          if (disabled) {
            return;
          }
          commitTextValue(event.currentTarget.value);
        }}
      >
        <option value="">Select option</option>
        {dropdownOptions.map(option => (
          <option key={`${inputId}-${option.value}`} value={option.value}>
            {option.text || option.label || option.value}
          </option>
        ))}
      </select>
    );
  }

  if (isDateField) {
    return (
      <div
        className={`flex h-full w-full flex-col rounded border px-2 py-1 ${inputContainerClass} ${invalidDateClasses || ''}`}
      >
        <input
          id={inputId}
          type="text"
          className="w-full border-0 bg-transparent p-0 text-sm leading-5 outline-none"
          value={optimisticTextValue}
          readOnly={disabled}
          aria-readonly={disabled}
          aria-invalid={isInvalidDateValue ? 'true' : 'false'}
          placeholder="DD-MM-YYYY"
          onFocus={onFocus}
          onClick={onFocus}
          onKeyDown={onKeyDown}
          onChange={handleTextInputChange}
        />
      </div>
    );
  }

  return (
    <input
      id={inputId}
      type="text"
      className={`h-full w-full rounded border px-2 py-1 text-sm outline-none ${inputContainerClass}`}
      value={optimisticTextValue}
      readOnly={disabled}
      aria-readonly={disabled}
      onFocus={onFocus}
      onClick={onFocus}
      onKeyDown={onKeyDown}
      onChange={handleTextInputChange}
    />
  );
}

export function TabularProjectCustomEditorTable({
  headerColumns,
  rows,
  showEmptyState,
  showRowControls = true,
  rowControlsAlignment = 'center',
  showAddRowControl = true,
  showRemoveRowControl = true,
  addRowLabel = 'Add new row +',
  removeRowLabel = 'Remove row -',
  tableActions,
  tableActiveCell,
  onActiveCellChange,
  disabled,
  canAddRow,
  canRemoveRow,
  addRowFromFooter,
  removeRowFromFooter,
  isCellFlagged,
  enableCellFlagQuickActions = false,
  canToggleCellFlags = false,
  onToggleCellFlag,
  onOpenCellReviewPanel,
  containerClassName,
  containerStyle,
}: TabularProjectCustomEditorTableProps) {
  const isRemoveRowDisabled = disabled || !canRemoveRow;
  const isAddRowDisabled = disabled || !canAddRow;
  const hasAnyRowControl = showRowControls && (showAddRowControl || showRemoveRowControl);
  const hasTableActions = !!tableActions;
  const topBarJustifyClass = hasAnyRowControl && hasTableActions
    ? 'justify-between'
    : hasTableActions
      ? 'justify-end'
      : rowControlsAlignment === 'start'
        ? 'justify-start'
        : 'justify-center';
  const headerRowHeight = TABULAR_GRID_HEADER_ROW_HEIGHT_PX;
  const rowHeight = Math.max(TABULAR_GRID_ROW_HEIGHT_PX, 60);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const dataGridRef = useRef<DataGridHandle | null>(null);
  const shouldScrollToNewRowRef = useRef(false);
  const lastScrolledCellKeyRef = useRef<string | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const [tableViewportWidth, setTableViewportWidth] = useState(0);
  const [cellContextMenu, setCellContextMenu] = useState<TabularCellContextMenuState | null>(null);
  const closeCellContextMenu = useCallback(() => {
    setCellContextMenu(null);
  }, []);
  const hasInlineFlagToggle = enableCellFlagQuickActions && !!onToggleCellFlag;
  const hasCellContextActions = enableCellFlagQuickActions && (!!onToggleCellFlag || !!onOpenCellReviewPanel);

  useEffect(() => {
    if (!hasCellContextActions && cellContextMenu) {
      closeCellContextMenu();
    }
  }, [cellContextMenu, closeCellContextMenu, hasCellContextActions]);

  useEffect(() => {
    if (!cellContextMenu || typeof window === 'undefined') {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (target && contextMenuRef.current?.contains(target)) {
        return;
      }
      closeCellContextMenu();
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeCellContextMenu();
      }
    };

    const handleWindowChange = () => closeCellContextMenu();

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleWindowChange);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleWindowChange);
    };
  }, [cellContextMenu, closeCellContextMenu]);

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

      lastScrolledCellKeyRef.current = `${targetCell.rowIndex}:${colIndex}`;
      onActiveCellChange({ row: targetCell.rowIndex, col: colIndex });
      scrollTabularGridCellIntoView(dataGridRef.current, {
        gridRowIndex: rowPosition,
        gridColumnIndex: colIndex,
      });
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          const input = document.getElementById(targetCell.inputId) as HTMLInputElement | HTMLSelectElement | null;
          if (!input) {
            return;
          }

          input.focus();
          if (
            input instanceof HTMLInputElement &&
            input.type !== 'checkbox' &&
            typeof input.setSelectionRange === 'function'
          ) {
            const caret = caretPosition === 'start' ? 0 : input.value.length;
            input.setSelectionRange(caret, caret);
          }
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

  const requestRowAppendForKeyboard = useCallback(() => {
    if (isAddRowDisabled) {
      return false;
    }

    shouldScrollToNewRowRef.current = true;
    addRowFromFooter();
    return true;
  }, [addRowFromFooter, isAddRowDisabled]);

  const openCellContextMenu = useCallback(
    (
      event: React.MouseEvent<HTMLElement>,
      rowIndex: number,
      colIndex: number,
      columnKey: string,
      isFlagged: boolean
    ) => {
      event.preventDefault();
      event.stopPropagation();
      onActiveCellChange({ row: rowIndex, col: colIndex });
      setCellContextMenu({
        x: event.clientX,
        y: event.clientY,
        rowIndex,
        colIndex,
        columnKey,
        isFlagged,
      });
    },
    [onActiveCellChange]
  );

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
          const showFlagControl = hasInlineFlagToggle && (isFlagged || isActiveCell);
          const canToggleThisCell = hasInlineFlagToggle && canToggleCellFlags && !disabled;

          const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
            const target = event.currentTarget;
            const stopKeyboardEvent = () => {
              event.preventDefault();
              event.stopPropagation();
            };

            if (target instanceof HTMLInputElement && isTabularCopyShortcut(event)) {
              const input = target;
              event.stopPropagation();

              if (shouldCopyWholeInputValue(input)) {
                stopKeyboardEvent();
                void copyTabularCellValueToClipboard(getInputCopyValue(input));
              }
              return;
            }

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
              inputType: target.type,
              selectionStart: target instanceof HTMLInputElement ? target.selectionStart : null,
              selectionEnd: target instanceof HTMLInputElement ? target.selectionEnd : null,
              valueLength: target.value.length,
              horizontalArrowBehavior: 'always',
            });

            if (!navigation) {
              const isCreateRowShortcut =
                isForwardTabWithoutModifiers(event) &&
                row.rowPosition === gridRows.length - 1 &&
                colIndex === headerColumns.length - 1;
              if (isCreateRowShortcut && requestRowAppendForKeyboard()) {
                stopKeyboardEvent();
                return;
              }

              // Without this, react-data-grid can intercept the event and trap keyboard navigation.
              if (isDirectionalArrowKey(event.key) && !event.altKey && !event.ctrlKey && !event.metaKey) {
                stopKeyboardEvent();
              }
              return;
            }

            stopKeyboardEvent();
            focusGridInput(navigation.nextRow, navigation.nextCol, navigation.caretPosition);
          };

          return (
            <div
              className="group"
              id={cell.cellElementId}
              onMouseDown={() => {
                focusGridInput(row.rowPosition, colIndex, 'end');
              }}
              onContextMenu={event => {
                if (!hasCellContextActions) {
                  return;
                }
                openCellContextMenu(event, cell.rowIndex, colIndex, cell.columnKey, isFlagged);
              }}
              style={{
                height: '100%',
                padding: 4,
                position: 'relative',
                background: isActiveCell ? '#def3e4' : isFlagged ? '#fef2f2' : isActiveRow ? '#f2fbf4' : '#fff',
              }}
            >
              {hasInlineFlagToggle ? (
                <FlagCellButton
                  isFlagged={isFlagged}
                  alwaysVisible={showFlagControl}
                  disabled={!canToggleThisCell}
                  onToggle={() => {
                    if (!onToggleCellFlag) {
                      return;
                    }
                    onActiveCellChange({ row: cell.rowIndex, col: colIndex });
                    onToggleCellFlag(cell.rowIndex, cell.columnKey);
                  }}
                />
              ) : null}
              <TabularGridCellInput
                inputId={cell.inputId}
                value={cell.value}
                fieldType={cell.fieldType}
                fieldOptions={cell.fieldOptions}
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
    canToggleCellFlags,
    columnWidth,
    disabled,
    hasCellContextActions,
    hasInlineFlagToggle,
    focusGridInput,
    gridRows.length,
    headerColumns,
    isCellFlagged,
    onActiveCellChange,
    onToggleCellFlag,
    openCellContextMenu,
    requestRowAppendForKeyboard,
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

    if (headerColumns.length > 0) {
      focusGridInput(lastRowPosition, 0, 'start');
      return;
    }

    scrollTabularGridCellIntoView(dataGridRef.current, { gridRowIndex: lastRowPosition });
  }, [focusGridInput, gridRows.length, headerColumns.length]);

  useEffect(() => {
    if (!tableActiveCell) {
      lastScrolledCellKeyRef.current = null;
      return;
    }

    const targetCellKey = `${tableActiveCell.row}:${tableActiveCell.col}`;
    if (lastScrolledCellKeyRef.current === targetCellKey) {
      return;
    }

    const targetRow = gridRows.find(row => row.rowIndex === tableActiveCell.row);
    const targetCell = targetRow?.row.cells[tableActiveCell.col];
    if (!targetCell) {
      return;
    }

    lastScrolledCellKeyRef.current = targetCellKey;
    scrollTabularGridCellIntoView(dataGridRef.current, {
      gridRowIndex: targetRow.rowPosition,
      gridColumnIndex: tableActiveCell.col,
    });
  }, [gridRows, tableActiveCell]);

  const handleAddRowFromFooter = useCallback(() => {
    requestRowAppendForKeyboard();
  }, [requestRowAppendForKeyboard]);

  return (
    <div
      className={joinClasses(
        'relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded border border-[#d6d6d6] bg-white',
        containerClassName
      )}
      style={containerStyle}
    >
      <TabularDataGridStyles scopeClassName="tabular-contributor-rdg" disableRowHover />
      {hasAnyRowControl || hasTableActions ? (
        <div
          className={`sticky top-0 z-[2] flex flex-none items-center gap-2 border-b border-[#d6d6d6] bg-[#f1f5f9] px-3 py-2 ${topBarJustifyClass}`}
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
                  className="!min-w-28 justify-center !px-3 !py-1.5 !text-sm !rounded-md font-semibold shadow-sm"
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
                  className="!min-w-28 justify-center !px-3 !py-1.5 !text-sm !rounded-md font-semibold shadow-sm"
                >
                  {addRowLabel}
                </Button>
              ) : null}
            </div>
          ) : null}
          {hasTableActions ? <div className="flex items-center gap-2">{tableActions}</div> : null}
        </div>
      ) : null}
      <div ref={tableScrollRef} className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <DataGrid
          ref={dataGridRef}
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
      {cellContextMenu && hasCellContextActions ? (
        <div
          ref={contextMenuRef}
          role="menu"
          className="fixed z-[80] min-w-[220px] rounded-md border border-slate-200 bg-white p-1 shadow-lg"
          style={{
            left: cellContextMenu.x,
            top: cellContextMenu.y,
          }}
        >
          <button
            type="button"
            role="menuitem"
            className="w-full rounded px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={disabled || !canToggleCellFlags || !onToggleCellFlag}
            onClick={() => {
              if (!onToggleCellFlag) {
                return;
              }
              onToggleCellFlag(cellContextMenu.rowIndex, cellContextMenu.columnKey);
              closeCellContextMenu();
            }}
          >
            {cellContextMenu.isFlagged ? 'Clear flag' : 'Flag cell for review'}
          </button>
          {onOpenCellReviewPanel ? (
            <button
              type="button"
              role="menuitem"
              className="w-full rounded px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
              onClick={() => {
                onOpenCellReviewPanel({ row: cellContextMenu.rowIndex, col: cellContextMenu.colIndex });
                closeCellContextMenu();
              }}
            >
              Open Cell review panel
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
