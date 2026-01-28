import React, { useMemo } from 'react';

type TabularHeadingsTableProps = {
  columns: number;
  headings: string[];
  onChangeHeadings: (next: string[]) => void;
  visibleRows?: number;
  onAddColumn?: () => void;
  onRemoveColumn?: () => void;
  onHeadingFocus?: (pos: { row: number; col: number }) => void;
};

export const TabularHeadingsTable: React.FC<TabularHeadingsTableProps> = ({
  columns,
  headings,
  onChangeHeadings,
  visibleRows = 5,
  onAddColumn,
  onRemoveColumn,
  onHeadingFocus,
}) => {
  const safeHeadings = useMemo(() => {
    return Array.from({ length: columns }, (_, i) => headings[i] ?? '');
  }, [columns, headings]);

  const updateHeading = (col: number, value: string) => {
    const next = safeHeadings.slice();
    next[col] = value;
    onChangeHeadings(next);
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
        <div style={{ flex: 1, overflow: 'hidden', border: '1px solid #ddd', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                {safeHeadings.map((h, c) => (
                  <th key={`h-${c}`} style={{ borderRight: '1px solid #e5e5e5', padding: 0 }}>
                    <input
                      value={h}
                      placeholder="Click to add header"
                      onFocus={() => onHeadingFocus?.({ row: 0, col: c })}
                      onChange={e => updateHeading(c, e.target.value)}
                      style={{
                        width: '100%',
                        border: 'none',
                        padding: '16px 12px',
                        fontSize: 13,
                        outline: 'none',
                        background: '#eef2ff',
                      }}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: visibleRows }, (_, r) => (
                <tr key={`r-${r}`}>
                  {Array.from({ length: columns }, (_, c) => (
                    <td key={`b-${r}-${c}`} style={{ borderTop: '1px solid #eee', borderRight: '1px solid #eee' }}>
                      <div
                        aria-disabled="true"
                        style={{
                          height: 44,
                          background: '#fafafa',
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* +/- column controls */}
        <div
          style={{
            width: 44,
            border: '1px solid #ddd',
            borderLeft: 'none',
            background: '#e6e6e6',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 10,
          }}
        >
          <button
            type="button"
            onClick={onAddColumn}
            disabled={!onAddColumn}
            style={{
              height: 44,
              border: '1px solid #bdbdbd',
              background: '#f7f7f7',
              borderRadius: 6,
              fontSize: 22,
              lineHeight: '44px',
              cursor: onAddColumn ? 'pointer' : 'not-allowed',
            }}
            aria-label="Add column"
          >
            +
          </button>
          <button
            type="button"
            onClick={onRemoveColumn}
            disabled={!onRemoveColumn}
            style={{
              height: 44,
              border: '1px solid #bdbdbd',
              background: '#f7f7f7',
              borderRadius: 6,
              fontSize: 22,
              lineHeight: '44px',
              cursor: onRemoveColumn ? 'pointer' : 'not-allowed',
            }}
            aria-label="Remove column"
          >
            −
          </button>
        </div>
      </div>
    </div>
  );
};
