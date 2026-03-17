import { useCallback, useMemo, useRef } from 'react';
import { DataGrid, type Column } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import type { TabularValidationIssue } from './types';
import {
  TABULAR_COLUMN_MIN_WIDTH_PX,
  TABULAR_GRID_HEADER_ROW_HEIGHT_PX,
  TABULAR_GRID_ROW_HEIGHT_PX,
} from '../../../../shared/utility/tabular-grid-constants';
import { TabularDataGridStyles } from '../../../../shared/components/TabularDataGridStyles';

export type TabularHeadingsTableProps = {
  columns: number;
  headings: string[];
  tooltips?: (string | undefined)[];
  onChangeHeadings: (next: string[]) => void;
  onColumnsReorder?: (sourceColumnIndex: number, targetColumnIndex: number) => void;

  visibleRows?: number;

  activeColumn?: number;
  onActiveColumnChange?: (index: number) => void;

  issues?: TabularValidationIssue[];
  disabled?: boolean;
};

type Row = { id: number };

function HeaderInput(props: {
  index: number;
  columnCount: number;
  value: string;
  disabled: boolean;
  hasError: boolean;
  title?: string;
  onFocus?: () => void;
  setInputRef: (index: number, node: HTMLInputElement | null) => void;
  onNavigateToColumn: (index: number, caretPosition: 'start' | 'end') => void;
  onChange: (next: string) => void;
}) {
  const { index, columnCount, value, disabled, hasError, title, onFocus, setInputRef, onNavigateToColumn, onChange } =
    props;

  return (
    <input
      ref={node => setInputRef(index, node)}
      value={value}
      placeholder="Click to add header"
      onFocus={onFocus}
      onChange={e => onChange(e.target.value)}
      onKeyDown={event => {
        // Keep keyboard behavior controlled by the input, not the grid container.
        event.stopPropagation();

        if (event.key === 'Tab') {
          const nextIndex = index + (event.shiftKey ? -1 : 1);
          if (nextIndex < 0 || nextIndex >= columnCount) {
            return;
          }

          event.preventDefault();
          onNavigateToColumn(nextIndex, event.shiftKey ? 'end' : 'start');
          return;
        }

        if (event.altKey || event.ctrlKey || event.metaKey) {
          return;
        }
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
          return;
        }

        const moveToPrevious = event.key === 'ArrowLeft';
        const nextIndex = index + (moveToPrevious ? -1 : 1);
        if (nextIndex < 0 || nextIndex >= columnCount) {
          return;
        }

        event.preventDefault();
        onNavigateToColumn(nextIndex, moveToPrevious ? 'end' : 'start');
      }}
      disabled={disabled}
      aria-invalid={hasError ? 'true' : 'false'}
      title={title}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        padding: '10px 12px',
        fontSize: 13,
        color: '#283452',
        textAlign: 'center',
        outline: 'none',
        background: 'transparent',
        boxShadow: hasError ? 'inset 0 0 0 2px rgba(220, 38, 38, 0.5)' : undefined,
      }}
    />
  );
}

export function TabularHeadingsTable(props: TabularHeadingsTableProps) {
  const {
    columns,
    headings,
    tooltips = [],
    onChangeHeadings,
    onColumnsReorder,
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
  const headingInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const setHeaderInputRef = useCallback((index: number, node: HTMLInputElement | null) => {
    headingInputRefs.current[index] = node;
  }, []);

  const focusHeaderInput = useCallback(
    (index: number, caretPosition: 'start' | 'end') => {
      onActiveColumnChange?.(index);
      requestAnimationFrame(() => {
        const input = headingInputRefs.current[index];
        if (!input) {
          return;
        }
        input.focus();
        const caret = caretPosition === 'end' ? input.value.length : 0;
        input.setSelectionRange(caret, caret);
        input.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
    },
    [onActiveColumnChange]
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
        width: TABULAR_COLUMN_MIN_WIDTH_PX,
        resizable: false,
        sortable: false,
        headerCellClass: 'tabular-heading-cell',
        draggable: !disabled,
        renderHeaderCell: () => (
          <div
            title={title}
            onMouseDown={() => onActiveColumnChange?.(c)}
            style={{
              height: '100%',
              padding: 0,
              background: c === activeColumn ? '#b9c8f5' : '#d9deee',
              boxShadow: c === activeColumn ? 'inset 0 0 0 2px #8aa3ea' : undefined,
              cursor: disabled ? 'default' : 'grab',
              transition: 'background-color 120ms ease, box-shadow 120ms ease',
            }}
          >
            <HeaderInput
              index={c}
              columnCount={columns}
              value={safeHeadings[c] ?? ''}
              disabled={disabled}
              hasError={hasError}
              title={title}
              setInputRef={setHeaderInputRef}
              onNavigateToColumn={focusHeaderInput}
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
              background: '#fff',
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
    setHeaderInputRef,
    focusHeaderInput,
    onChangeHeadings,
  ]);

  const headerRowHeight = TABULAR_GRID_HEADER_ROW_HEIGHT_PX;
  const rowHeight = TABULAR_GRID_ROW_HEIGHT_PX;
  const gridHeight = headerRowHeight + rowHeight * rows.length + 2;
  const minGridWidth = columns * TABULAR_COLUMN_MIN_WIDTH_PX + 2;

  return (
    <>
      <TabularDataGridStyles scopeClassName="tabular-rdg" />
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
          border: '1px solid #d6d6d6',
          ['--rdg-selection-width' as string]: '0px',
          ['--rdg-border-color' as string]: '#d6d6d6',
        }}
        onColumnsReorder={(sourceColumnKey, targetColumnKey) => {
          if (!onColumnsReorder) {
            return;
          }

          const sourceColumnIndex = Number.parseInt(sourceColumnKey.replace(/^c-/, ''), 10);
          const targetColumnIndex = Number.parseInt(targetColumnKey.replace(/^c-/, ''), 10);

          if (!Number.isFinite(sourceColumnIndex) || !Number.isFinite(targetColumnIndex)) {
            return;
          }
          if (sourceColumnIndex < 0 || sourceColumnIndex >= columns) {
            return;
          }
          if (targetColumnIndex < 0 || targetColumnIndex >= columns) {
            return;
          }

          onColumnsReorder(sourceColumnIndex, targetColumnIndex);
        }}
      />
    </>
  );
}
