import React, { useMemo } from 'react';
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

export const TabularPreviewTable: React.FC<TabularPreviewTableProps> = ({
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
}) => {
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

  const updateCell = (rowIndex: number, colIndex: number, nextValue: string) => {
    const nextRows = safeValues.map(row => row.slice());
    nextRows[rowIndex][colIndex] = nextValue;
    onChange(nextRows);
  };

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
      <div
        style={{
          overflow: 'scroll',
          flex: hasFixedHeight ? '1 1 auto' : undefined,
          minHeight: 0,
        }}
      >
        <table
          style={{
            width: safeColumns * 220,
            minWidth: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
          }}
        >
          <thead>
            <tr>
              {safeHeadings.map((heading, colIndex) => {
                const tooltip = safeTooltips[colIndex];
                const title = tooltip ? `${heading}\n${tooltip}` : heading;
                return (
                  <th
                    key={`header-${colIndex}`}
                    style={{
                      border: '1px solid #d6d6d6',
                      background: '#d9deee',
                      color: '#283452',
                      fontSize: 13,
                      fontWeight: 500,
                      height: 52,
                      padding: '8px 10px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                    }}
                    title={title}
                  >
                    <div style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{heading}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {safeValues.map((row, rowIndex) => {
              const isActiveRow = activeCell?.row === rowIndex;

              return (
                <tr key={`row-${rowIndex}`} style={{ background: isActiveRow ? '#eef9f1' : '#fff' }}>
                  {row.map((value, colIndex) => {
                    const isActiveCell = activeCell?.row === rowIndex && activeCell?.col === colIndex;
                    return (
                      <td
                        key={`cell-${rowIndex}-${colIndex}`}
                        style={{
                          border: '1px solid #d6d6d6',
                          height: 46,
                          padding: 0,
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
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
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
};
