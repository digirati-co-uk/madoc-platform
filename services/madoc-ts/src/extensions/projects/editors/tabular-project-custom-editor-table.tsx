import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  DataGrid,
  type CellKeyDownArgs,
  type CellKeyboardEvent,
  type CellMouseArgs,
  type CellSelectArgs,
  type Column,
  type DataGridHandle,
  type FillEvent,
  type MultiCellClipboardArgs,
  type RowsChangeData,
} from 'react-data-grid';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-data-grid/lib/styles.css';
import type { TabularCellRef } from '@/frontend/shared/utility/tabular-types';
import { Button } from '@/frontend/shared/navigation/Button';
import {
  TABULAR_COLUMN_MIN_WIDTH_PX,
  TABULAR_GRID_HEADER_ROW_HEIGHT_PX,
  TABULAR_GRID_ROW_HEIGHT_PX,
} from '@/frontend/shared/utility/tabular-grid-constants';
import {
  formatTabularClipboardMatrix,
  getTabularCellClipboardText,
  parseTabularClipboardMatrix,
  parseTabularCellClipboardText,
} from '@/frontend/shared/utility/tabular-grid-clipboard';
import { TabularDataGridStyles } from '@/frontend/shared/components/TabularDataGridStyles';
import { scrollTabularGridCellIntoView } from '@/frontend/shared/utility/tabular-grid-scroll';
import { formatDateFieldInput, isValidDateFieldValue } from '@/frontend/shared/utility/date-field-format';
import FlagIcon from '@/frontend/shared/icons/FlagIcon';
import type {
  TabularEditorCellModel,
  TabularEditorHeaderModel,
  TabularEditorRowModel,
} from './tabular-project-custom-editor-table-model';

type TabularProjectCustomEditorTableProps = {
  headerColumns: TabularEditorHeaderModel[];
  rows: TabularEditorRowModel[];
  onRowsChange?: (nextRows: TabularEditorRowModel[], changedRowPositions: readonly number[]) => void;
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
  isCellNoted: (rowIndex: number, columnKey: string) => boolean;
  enableCellFlagQuickActions?: boolean;
  canToggleCellFlags?: boolean;
  onToggleCellFlag?: (rowIndex: number, columnKey: string) => void;
  onOpenCellReviewPanel?: (next: TabularCellRef) => void;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  showHeaderTooltips?: boolean;
};

type TabularGridRow = {
  id: string;
  rowIndex: number;
  rowPosition: number;
  row: TabularEditorRowModel;
};

type FlagCellButtonProps = {
  isFlagged: boolean;
  isNoted: boolean;
  alwaysVisible: boolean;
  disabled: boolean;
  onToggle: () => void;
};

const FLAG_LABEL_DEFAULT = 'Flag cell for review';
const FLAG_LABEL_NOTED = 'Mark as needs review';
const FLAG_LABEL_FLAGGED = 'Clear flag';
const CELL_BACKGROUND_COLORS = {
  active: '#def3e4',
  activeRow: '#f2fbf4',
  flagged: '#fef2f2',
  noted: '#eff6ff',
  default: '#fff',
} as const;

function getFlagToggleLabel(isFlagged: boolean, isNoted: boolean): string {
  if (isFlagged) {
    return FLAG_LABEL_FLAGGED;
  }

  if (isNoted) {
    return FLAG_LABEL_NOTED;
  }

  return FLAG_LABEL_DEFAULT;
}

function getFlagButtonVariantClasses(isFlagged: boolean, isNoted: boolean): string {
  if (isFlagged) {
    return 'border-red-300 bg-red-100 text-red-700';
  }

  if (isNoted) {
    return 'border-blue-300 bg-blue-100 text-blue-700';
  }

  return 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50';
}

function getInputContainerClass(
  isReadOnlyField: boolean,
  isActiveCell: boolean,
  isFlagged: boolean,
  isNoted: boolean
): string {
  if (isReadOnlyField) {
    return isFlagged || isNoted || isActiveCell
      ? 'border-slate-400 bg-slate-100 cursor-not-allowed'
      : 'border-slate-300 bg-slate-100 cursor-not-allowed';
  }

  if (isActiveCell) {
    return 'border-[#34a853] bg-[#def3e4]';
  }

  if (isFlagged) {
    return 'border-red-300 bg-red-50';
  }

  if (isNoted) {
    return 'border-blue-300 bg-blue-50';
  }

  return 'border-transparent bg-transparent';
}

function getCellBackgroundColor(
  isActiveCell: boolean,
  isFlagged: boolean,
  isNoted: boolean,
  isActiveRow: boolean
): string {
  if (isActiveCell) {
    return CELL_BACKGROUND_COLORS.active;
  }

  if (isFlagged) {
    return CELL_BACKGROUND_COLORS.flagged;
  }

  if (isNoted) {
    return CELL_BACKGROUND_COLORS.noted;
  }

  if (isActiveRow) {
    return CELL_BACKGROUND_COLORS.activeRow;
  }

  return CELL_BACKGROUND_COLORS.default;
}

function FlagCellButton({ isFlagged, isNoted, alwaysVisible, disabled, onToggle }: FlagCellButtonProps) {
  const variantClasses = getFlagButtonVariantClasses(isFlagged, isNoted);
  const buttonLabel = getFlagToggleLabel(isFlagged, isNoted);
  const visibilityClasses = alwaysVisible
    ? 'pointer-events-auto opacity-100'
    : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100';

  return (
    <button
      type="button"
      className={`absolute right-2 top-2 z-[1] inline-flex h-6 w-6 items-center justify-center rounded border text-xs transition ${variantClasses} ${visibilityClasses} disabled:cursor-not-allowed disabled:opacity-60`}
      title={buttonLabel}
      aria-label={buttonLabel}
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

function updateGridRowCellValue(row: TabularGridRow, colIndex: number, value: unknown): TabularGridRow {
  const currentCell = row.row.cells[colIndex];
  if (!currentCell || Object.is(currentCell.value, value)) {
    return row;
  }

  const cells = row.row.cells.map((cell, index) => (index === colIndex ? { ...cell, value } : cell));
  return { ...row, row: { ...row.row, cells } };
}

type TabularGridCellInputProps = {
  inputId: string;
  value: unknown;
  fieldType?: string;
  fieldOptions?: Array<{ value: string; text: string; label?: string }>;
  disabled: boolean;
  onChange: (nextValue: unknown) => void;
  isFlagged: boolean;
  isNoted: boolean;
};

type TabularCellContextMenuState = {
  x: number;
  y: number;
  rowIndex: number;
  colIndex: number;
  columnKey: string;
  isFlagged: boolean;
  isNoted: boolean;
  canToggleFlag: boolean;
};

function getDropdownDisplayText(
  options: Array<{ value: string; text: string; label?: string }>,
  selectedValue: string
): string {
  const selectedOption = options.find(option => option.value === selectedValue);
  return selectedOption?.text || selectedOption?.label || selectedValue;
}

function TabularGridCellInput(options: TabularGridCellInputProps) {
  const { inputId, value, fieldType, fieldOptions, disabled, onChange, isFlagged, isNoted } = options;
  const [optimisticTextValue, setOptimisticTextValue] = useState<string>(() => toTextValue(value));
  const [optimisticCheckedValue, setOptimisticCheckedValue] = useState<boolean>(() => !!value);

  const isCheckboxField = fieldType === 'checkbox-field';
  const isDateField = fieldType === 'date-field';
  const isDropdownField = fieldType === 'dropdown-field';
  const isReadOnlyField = fieldType === 'read-only-field';
  const isInvalidDateValue = isDateField && !isValidDateFieldValue(optimisticTextValue);
  const invalidDateClasses = isInvalidDateValue ? 'border-red-400 bg-red-50' : undefined;
  const dropdownOptions = fieldOptions ?? [];
  const inputContainerClass = getInputContainerClass(isReadOnlyField, true, isFlagged, isNoted);

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
    if (disabled || isReadOnlyField) {
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
          autoFocus
          aria-disabled={disabled}
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

  if (isDropdownField) {
    return (
      <select
        id={inputId}
        className={`h-full w-full rounded border px-2 py-1 text-sm outline-none ${inputContainerClass}`}
        value={optimisticTextValue}
        autoFocus
        disabled={disabled}
        aria-disabled={disabled}
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
      <div className="relative h-full w-full">
        <div
          className={`flex h-full w-full flex-col rounded border px-2 py-1 ${inputContainerClass} ${invalidDateClasses || ''}`}
        >
          <input
            id={inputId}
            type="text"
            className="w-full border-0 bg-transparent p-0 text-sm leading-5 outline-none"
            value={optimisticTextValue}
            autoFocus
            readOnly={disabled || isReadOnlyField}
            aria-readonly={disabled || isReadOnlyField}
            aria-invalid={isInvalidDateValue ? 'true' : 'false'}
            placeholder="DD-MM-YYYY"
            title={isReadOnlyField ? 'Read-only field' : undefined}
            onChange={handleTextInputChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <input
        id={inputId}
        type="text"
        className={`h-full w-full rounded border px-2 py-1 text-sm outline-none ${inputContainerClass}`}
        value={optimisticTextValue}
        autoFocus
        readOnly={disabled || isReadOnlyField}
        aria-readonly={disabled || isReadOnlyField}
        title={isReadOnlyField ? 'Read-only field' : undefined}
        onChange={handleTextInputChange}
      />
    </div>
  );
}

type TabularGridCellDisplayProps = {
  cell: TabularEditorCellModel;
  isActiveCell: boolean;
  isFlagged: boolean;
  isNoted: boolean;
};

function TabularGridCellDisplay({ cell, isActiveCell, isFlagged, isNoted }: TabularGridCellDisplayProps) {
  const isReadOnlyField = cell.fieldType === 'read-only-field';
  const isCheckboxField = cell.fieldType === 'checkbox-field';
  const textValue = toTextValue(cell.value);
  const displayValue =
    cell.fieldType === 'dropdown-field'
      ? getDropdownDisplayText(cell.fieldOptions ?? [], textValue)
      : isCheckboxField
        ? cell.value
          ? 'Yes'
          : 'No'
        : textValue;
  const inputContainerClass = getInputContainerClass(isReadOnlyField, isActiveCell, isFlagged, isNoted);

  return (
    <div
      className={`relative flex h-full w-full items-center rounded border px-2 py-1 text-sm leading-5 ${inputContainerClass}`}
      style={{
        justifyContent: isCheckboxField ? 'center' : undefined,
        whiteSpace: 'normal',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
        overflow: 'hidden',
        paddingRight: isReadOnlyField ? 64 : undefined,
      }}
      title={isReadOnlyField ? 'Read-only field' : displayValue || undefined}
    >
      {isReadOnlyField ? (
        <span
          className="pointer-events-none absolute right-2 top-2 inline-flex rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700"
          aria-hidden="true"
        >
          Read only
        </span>
      ) : null}
      {displayValue || '\u00A0'}
    </div>
  );
}

export function TabularProjectCustomEditorTable({
  headerColumns,
  rows,
  onRowsChange,
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
  isCellNoted,
  enableCellFlagQuickActions = false,
  canToggleCellFlags = false,
  onToggleCellFlag,
  onOpenCellReviewPanel,
  containerClassName,
  containerStyle,
  showHeaderTooltips = false,
}: TabularProjectCustomEditorTableProps) {
  const headerTooltipId = useId();
  const isRemoveRowDisabled = disabled || !canRemoveRow;
  const isAddRowDisabled = disabled || !canAddRow;
  const hasAnyRowControl = showRowControls && (showAddRowControl || showRemoveRowControl);
  const hasTableActions = !!tableActions;
  const topBarJustifyClass =
    hasAnyRowControl && hasTableActions
      ? 'justify-between'
      : hasTableActions
        ? 'justify-end'
        : rowControlsAlignment === 'start'
          ? 'justify-start'
          : 'justify-center';
  const headerRowHeight = Math.max(TABULAR_GRID_HEADER_ROW_HEIGHT_PX, 60);
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

  const selectGridCell = useCallback(
    (rowPosition: number, colIndex: number, enableEditor = false) => {
      const targetRow = gridRows[rowPosition];
      const targetCell = targetRow?.row.cells[colIndex];
      if (!targetCell) {
        return false;
      }

      lastScrolledCellKeyRef.current = `${targetCell.rowIndex}:${colIndex}`;
      dataGridRef.current?.selectCell({ rowIdx: rowPosition, idx: colIndex }, { enableEditor, shouldFocusCell: true });
      scrollTabularGridCellIntoView(dataGridRef.current, {
        gridRowIndex: rowPosition,
        gridColumnIndex: colIndex,
      });

      return true;
    },
    [gridRows]
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
      isFlagged: boolean,
      isNoted: boolean,
      canToggleFlag: boolean
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
        isNoted,
        canToggleFlag,
      });
    },
    [onActiveCellChange]
  );

  const commitGridRows = useCallback(
    (nextRows: TabularGridRow[], indexes: readonly number[]) => {
      if (onRowsChange) {
        onRowsChange(
          nextRows.map(nextRow => nextRow.row),
          indexes
        );
        return;
      }

      for (const rowIndex of indexes) {
        const previousCells = gridRows[rowIndex]?.row.cells ?? [];
        const nextCells = nextRows[rowIndex]?.row.cells ?? [];
        for (let colIndex = 0; colIndex < nextCells.length; colIndex++) {
          const previousCell = previousCells[colIndex];
          const nextCell = nextCells[colIndex];
          if (previousCell && nextCell && !Object.is(previousCell.value, nextCell.value)) {
            previousCell.onChange(nextCell.value);
          }
        }
      }
    },
    [gridRows, onRowsChange]
  );

  const handleRowsChange = useCallback(
    (nextRows: TabularGridRow[], { indexes }: RowsChangeData<TabularGridRow>) => {
      commitGridRows(nextRows, indexes);
    },
    [commitGridRows]
  );

  const handleFill = useCallback(
    ({ columnKey, sourceRow, targetRow }: FillEvent<TabularGridRow>) => {
      const colIndex = headerColumns.findIndex(column => column.key === columnKey);
      const sourceCell = sourceRow.row.cells[colIndex];
      const targetCell = targetRow.row.cells[colIndex];
      if (!sourceCell || !targetCell || targetCell.fieldType === 'read-only-field') {
        return targetRow;
      }

      return updateGridRowCellValue(targetRow, colIndex, sourceCell.value);
    },
    [headerColumns]
  );

  const gridColumns = useMemo<readonly Column<TabularGridRow>[]>(() => {
    return headerColumns.map((column, colIndex) => {
      return {
        key: column.key,
        name: '',
        width: columnWidth,
        sortable: false,
        resizable: false,
        editable: row => !disabled && row.row.cells[colIndex]?.fieldType !== 'read-only-field',
        renderHeaderCell: () => {
          const isActiveColumn = tableActiveCell?.col === colIndex;
          const tooltip = showHeaderTooltips ? column.description?.trim() || undefined : undefined;

          return (
            <div
              style={{
                height: '100%',
                background: isActiveColumn ? '#b9c8f5' : '#d9deee',
                boxShadow: isActiveColumn ? 'inset 0 0 0 2px #8aa3ea' : undefined,
                color: '#283452',
                display: 'grid',
                alignContent: 'center',
                padding: '10px 12px',
                textAlign: 'left',
                whiteSpace: 'normal',
                overflowWrap: 'anywhere',
                wordBreak: 'break-word',
              }}
            >
              <div className="flex items-center gap-1" style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
                {column.label}
                {tooltip ? (
                  <span
                    aria-label={tooltip}
                    data-tooltip-content={tooltip}
                    data-tooltip-id={headerTooltipId}
                    tabIndex={0}
                    className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full border border-slate-400 text-[11px] font-normal leading-none text-slate-600"
                  >
                    ?
                  </span>
                ) : null}
              </div>
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
          const isReadOnlyCell = cell.fieldType === 'read-only-field';
          const canCellBeFlagged = !isReadOnlyCell;
          const isFlagged = canCellBeFlagged ? isCellFlagged(cell.rowIndex, cell.columnKey) : false;
          const isNoted = !isFlagged && canCellBeFlagged ? isCellNoted(cell.rowIndex, cell.columnKey) : false;
          const canToggleThisCell = hasInlineFlagToggle && canToggleCellFlags && !disabled && canCellBeFlagged;
          const showFlagControl = canToggleThisCell && (isFlagged || isNoted || isActiveCell);
          const canToggleFromContextMenu = !!onToggleCellFlag && canToggleCellFlags && !disabled && !isReadOnlyCell;
          const hasContextMenuForCell = !!onOpenCellReviewPanel || canToggleFromContextMenu;

          return (
            <div
              className="group"
              id={cell.cellElementId}
              onContextMenu={event => {
                if (!hasCellContextActions || !hasContextMenuForCell) {
                  return;
                }
                openCellContextMenu(
                  event,
                  cell.rowIndex,
                  colIndex,
                  cell.columnKey,
                  isFlagged,
                  isNoted,
                  canToggleFromContextMenu
                );
              }}
              style={{
                height: '100%',
                padding: 4,
                position: 'relative',
                background: getCellBackgroundColor(isActiveCell, isFlagged, isNoted, isActiveRow),
              }}
            >
              {hasInlineFlagToggle && canToggleThisCell ? (
                <FlagCellButton
                  isFlagged={isFlagged}
                  isNoted={isNoted}
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
              <TabularGridCellDisplay cell={cell} isActiveCell={isActiveCell} isFlagged={isFlagged} isNoted={isNoted} />
            </div>
          );
        },
        renderEditCell: ({ row, onRowChange }) => {
          const cell = row.row.cells[colIndex];
          if (!cell) {
            return null;
          }

          const isFlagged = isCellFlagged(cell.rowIndex, cell.columnKey);
          const isNoted = !isFlagged && isCellNoted(cell.rowIndex, cell.columnKey);

          return (
            <div
              id={cell.cellElementId}
              style={{
                height: '100%',
                padding: 4,
                background: getCellBackgroundColor(true, isFlagged, isNoted, true),
              }}
            >
              <TabularGridCellInput
                inputId={cell.inputId}
                value={cell.value}
                fieldType={cell.fieldType}
                fieldOptions={cell.fieldOptions}
                disabled={disabled}
                isFlagged={isFlagged}
                isNoted={isNoted}
                onChange={value => onRowChange(updateGridRowCellValue(row, colIndex, value))}
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
    headerColumns,
    isCellFlagged,
    isCellNoted,
    onActiveCellChange,
    onOpenCellReviewPanel,
    onToggleCellFlag,
    openCellContextMenu,
    showHeaderTooltips,
    tableActiveCell,
  ]);

  const handleCellClick = useCallback(
    (args: CellMouseArgs<TabularGridRow>) => {
      const cell = args.row.row.cells[args.column.idx];
      if (disabled || !cell || cell.fieldType === 'read-only-field') {
        return;
      }

      if (cell.fieldType === 'checkbox-field') {
        const nextRows = [...gridRows];
        nextRows[args.rowIdx] = updateGridRowCellValue(args.row, args.column.idx, !cell.value);
        handleRowsChange(nextRows, { indexes: [args.rowIdx], column: args.column });
      }
    },
    [disabled, gridRows, handleRowsChange]
  );

  const handleSelectedCellChange = useCallback(
    ({ row, column }: CellSelectArgs<TabularGridRow>) => {
      if (!row) {
        onActiveCellChange(null);
        return;
      }

      lastScrolledCellKeyRef.current = `${row.rowIndex}:${column.idx}`;
      onActiveCellChange({ row: row.rowIndex, col: column.idx });
    },
    [onActiveCellChange]
  );

  const handleMultiCellCopy = useCallback(
    (
      { rows: selectedRows, columns }: MultiCellClipboardArgs<TabularGridRow>,
      event: React.ClipboardEvent<HTMLDivElement>
    ) => {
      const values = selectedRows.map(row =>
        columns.map(column => {
          const cell = row.row.cells[column.idx];
          return cell ? getTabularCellClipboardText(cell) : '';
        })
      );
      event.clipboardData.setData('text/plain', formatTabularClipboardMatrix(values));
      event.preventDefault();
    },
    []
  );

  const handleMultiCellPaste = useCallback(
    ({ range }: MultiCellClipboardArgs<TabularGridRow>, event: React.ClipboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      const clipboardRows = parseTabularClipboardMatrix(event.clipboardData.getData('text/plain'));
      if (clipboardRows.length === 0) {
        return;
      }

      event.preventDefault();
      const nextRows = [...gridRows];
      const changedRowPositions = new Set<number>();
      for (let rowOffset = 0; rowOffset < clipboardRows.length; rowOffset++) {
        const rowPosition = range.startRowIdx + rowOffset;
        let nextRow = nextRows[rowPosition];
        if (!nextRow) {
          break;
        }

        for (let colOffset = 0; colOffset < clipboardRows[rowOffset].length; colOffset++) {
          const colIndex = range.startColumnIdx + colOffset;
          const cell = nextRow.row.cells[colIndex];
          if (!cell || cell.fieldType === 'read-only-field') {
            continue;
          }

          const parsed = parseTabularCellClipboardText(cell, clipboardRows[rowOffset][colOffset]);
          if (!parsed.accepted) {
            continue;
          }

          const value =
            cell.fieldType === 'date-field' ? formatDateFieldInput(toTextValue(parsed.value)) : parsed.value;
          const updatedRow = updateGridRowCellValue(nextRow, colIndex, value);
          if (updatedRow !== nextRow) {
            nextRow = updatedRow;
            nextRows[rowPosition] = updatedRow;
            changedRowPositions.add(rowPosition);
          }
        }
      }

      if (changedRowPositions.size > 0) {
        commitGridRows(nextRows, [...changedRowPositions]);
      }
    },
    [commitGridRows, disabled, gridRows]
  );

  const handleCellKeyDown = useCallback(
    (args: CellKeyDownArgs<TabularGridRow>, event: CellKeyboardEvent) => {
      const isLastCell =
        event.key === 'Tab' &&
        !event.shiftKey &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        args.rowIdx === gridRows.length - 1 &&
        args.column.idx === headerColumns.length - 1;
      if (!isLastCell || isAddRowDisabled) {
        return;
      }

      event.preventDefault();
      event.preventGridDefault();
      if (args.mode === 'EDIT') {
        args.onClose(true, false);
      }
      requestRowAppendForKeyboard();
    },
    [gridRows.length, headerColumns.length, isAddRowDisabled, requestRowAppendForKeyboard]
  );

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
      selectGridCell(lastRowPosition, 0);
      return;
    }

    scrollTabularGridCellIntoView(dataGridRef.current, { gridRowIndex: lastRowPosition });
  }, [gridRows.length, headerColumns.length, selectGridCell]);

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
    if (!targetRow?.row.cells[tableActiveCell.col]) {
      return;
    }

    selectGridCell(targetRow.rowPosition, tableActiveCell.col);
  }, [gridRows, selectGridCell, tableActiveCell]);

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
          onRowsChange={handleRowsChange}
          onSelectedCellChange={handleSelectedCellChange}
          onCellClick={handleCellClick}
          onCellKeyDown={handleCellKeyDown}
          onMultiCellCopy={handleMultiCellCopy}
          onMultiCellPaste={handleMultiCellPaste}
          onFill={disabled ? undefined : handleFill}
          enableRangeSelection
          enableVirtualization={false}
          headerRowHeight={headerRowHeight}
          rowHeight={rowHeight}
          style={{
            height: '100%',
            width: '100%',
            border: 'none',
            ['--rdg-border-color' as string]: '#d6d6d6',
            ['--rdg-selection-color' as string]: '#34a853',
          }}
        />
      </div>
      {showEmptyState ? (
        <div className="border-t border-[#d6d6d6] px-3 py-6 text-center text-sm text-gray-600">
          No rows yet. Use + to create the first row.
        </div>
      ) : null}
      {showHeaderTooltips ? (
        <ReactTooltip
          className="react-tooltip"
          id={headerTooltipId}
          place="top"
          positionStrategy="fixed"
          variant="dark"
        />
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
          {cellContextMenu.canToggleFlag ? (
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
              {getFlagToggleLabel(cellContextMenu.isFlagged, cellContextMenu.isNoted)}
            </button>
          ) : null}
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
