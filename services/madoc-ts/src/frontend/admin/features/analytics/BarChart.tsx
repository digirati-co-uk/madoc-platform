import React, { useId, useState } from 'react';
import { useChartInteraction } from './use-chart-interaction';

interface BarChartDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDatum[];
  title: string;
  description?: string;
  color?: string;
  chartHeight?: number;
  /** Optional unit suffix for tooltip, e.g. "views" or "visits" */
  unit?: string;
}

function formatLabel(label: string): string {
  // Strip year from YYYY-MM-DD → MM-DD
  return label.length === 10 && label[4] === '-' ? label.slice(5) : label;
}

function niceGridLines(max: number): number[] {
  const rawStep = max / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step = Math.max(1, Math.ceil(rawStep / magnitude) * magnitude);
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, index) => index * step);
}

export function BarChart({
  data,
  title,
  description,
  color = '#4157bb',
  chartHeight = 180,
  unit = 'views',
}: BarChartProps) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const tableId = `${uid}-table`;
  const [showTable, setShowTable] = useState(false);
  const n = data.length;
  const { activeIndex: activeIdx, handlers } = useChartInteraction(n);
  const activeItem = activeIdx === null ? null : data[activeIdx];
  const tooltipXPct = activeIdx === null ? 0 : ((activeIdx + 0.5) / n) * 100;
  const total = data.reduce((s, d) => s + d.value, 0);
  const rawMax = Math.max(...data.map(d => d.value), 1);
  const grids = niceGridLines(rawMax);
  const yMax = grids[grids.length - 1] ?? rawMax;

  const labelCount = Math.min(n, 5);
  const labelIndices = Array.from({ length: labelCount }, (_, i) =>
    labelCount === 1 ? 0 : Math.round((i * (n - 1)) / (labelCount - 1))
  );
  const slotPct = n > 0 ? 100 / n : 100;
  const detailId = `${uid}-detail`;
  const helpId = `${uid}-help`;

  return (
    <div className="min-w-0">
      {/* Header row */}
      <div className="flex items-baseline justify-between mb-2 gap-2">
        <h3 className="text-sm font-semibold text-[#24386b]" id={titleId}>
          {title}
        </h3>
        <button
          type="button"
          className="shrink-0 text-xs text-[#4157bb] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4157bb] rounded"
          onClick={() => setShowTable(v => !v)}
          aria-expanded={showTable}
          aria-controls={tableId}
        >
          {showTable ? 'Hide table' : 'Show as table'}
        </button>
      </div>

      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}

      <p id={helpId} className="sr-only">
        Use left and right arrow keys to explore dates, Home or End to jump, and Escape to dismiss details.
      </p>
      <p id={detailId} className="sr-only" aria-live="polite" aria-atomic="true">
        {activeItem ? `${activeItem.label}: ${activeItem.value.toLocaleString()} ${unit}` : ''}
      </p>
      {total === 0 ? (
        <div
          className="flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 text-sm text-gray-500"
          style={{ height: chartHeight + 24 }}
          aria-label={`${title}: no activity recorded`}
        >
          No activity recorded for this period
        </div>
      ) : (
        // Two-column grid: y-axis labels | chart area
        <div className="flex gap-0">
          {/* Y-axis: HTML labels aligned by percentage to match gridlines */}
          <div className="relative flex-none w-12" style={{ height: chartHeight }} aria-hidden="true">
            {grids.map(g => {
              const topPct = yMax > 0 ? (1 - g / yMax) * 100 : 0;
              return (
                <span
                  key={g}
                  className="absolute right-1.5 text-xs leading-none text-gray-500 tabular-nums"
                  style={{ top: `${topPct}%`, transform: 'translateY(-50%)' }}
                >
                  {g >= 1000 ? `${(g / 1000).toFixed(g % 1000 === 0 ? 0 : 1)}k` : g}
                </span>
              );
            })}
          </div>

          {/* Chart area: SVG + HTML x-axis labels + tooltip */}
          <div className="flex-1 min-w-0 relative" style={{ height: chartHeight + 24 }}>
            {/* SVG: bars and gridlines only — no SVG text */}
            <svg
              role="group"
              aria-roledescription="interactive chart"
              aria-labelledby={titleId}
              aria-describedby={`${helpId} ${detailId}`}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full absolute top-0 left-0 cursor-crosshair rounded-t focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4157bb]"
              style={{ height: chartHeight }}
              tabIndex={0}
              {...handlers}
            >
              {/* Horizontal gridlines */}
              {grids.map(g => {
                const yPct = yMax > 0 ? (1 - g / yMax) * 100 : 100;
                return (
                  <line
                    key={g}
                    x1="0"
                    y1={yPct}
                    x2="100"
                    y2={yPct}
                    stroke={g === 0 ? '#cbd5e1' : '#e2e8f0'}
                    strokeWidth={g === 0 ? '1' : '0.75'}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}

              {/* Bars */}
              {data.map((d, i) => {
                const barH = yMax > 0 ? (d.value / yMax) * 100 : 0;
                const x = i * slotPct;
                const isActive = activeIdx === i;
                return (
                  <rect
                    key={i}
                    x={x + slotPct * 0.1}
                    y={100 - barH}
                    width={slotPct * 0.8}
                    height={barH}
                    fill={color}
                    opacity={isActive ? 1 : 0.72}
                    rx="0.4"
                  />
                );
              })}

              {/* Active date remains visible even when its count is zero. */}
              {activeIdx !== null && (
                <rect
                  x={activeIdx * slotPct}
                  y={0}
                  width={slotPct}
                  height={100}
                  fill="none"
                  stroke="#4157bb"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="2 2"
                  opacity="0.5"
                />
              )}
            </svg>

            {/* X-axis HTML date labels — natural font size, no SVG text stretch */}
            <div className="absolute left-0 right-0" style={{ top: chartHeight, height: 24 }} aria-hidden="true">
              {labelIndices.map((i, labelIndex) => (
                <span
                  key={i}
                  className="absolute text-xs leading-none text-gray-500 tabular-nums whitespace-nowrap"
                  style={{
                    left: `${((i + 0.5) / n) * 100}%`,
                    top: 8,
                    transform: `translateX(${labelCount === 1 ? '-50%' : labelIndex === 0 ? '0' : labelIndex === labelCount - 1 ? '-100%' : '-50%'})`,
                  }}
                >
                  {formatLabel(data[i].label)}
                </span>
              ))}
            </div>

            {/* Hover / keyboard tooltip — HTML, always natural size */}
            {activeItem && (
              <div
                className="bg-[#24386b] text-white text-xs rounded-md px-2.5 py-1.5 shadow-lg"
                role="tooltip"
                style={{
                  position: 'absolute',
                  top: 8,
                  zIndex: 10,
                  pointerEvents: 'none',
                  left: `clamp(4.5rem, ${tooltipXPct}%, calc(100% - 4.5rem))`,
                  transform: 'translateX(-50%)',
                  width: '9rem',
                  textAlign: 'center',
                }}
              >
                <div className="font-medium text-white/80 text-xs mb-0.5">{activeItem.label}</div>
                <div className="tabular-nums font-semibold">
                  {activeItem.value.toLocaleString()}
                  {unit && <span className="font-normal text-white/70"> {unit}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Accessible data table */}
      <div id={tableId} hidden={!showTable} className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-gray-200">
        <table className="w-full text-xs border-collapse">
          <caption className="sr-only">{title} – data table</caption>
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              <th className="text-left px-3 py-1.5 border-b border-gray-200 font-medium text-gray-600">Date</th>
              <th className="text-right px-3 py-1.5 border-b border-gray-200 font-medium text-gray-600">Count</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                <td className="px-3 py-1 border-b border-gray-100 text-gray-700">{d.label}</td>
                <td className="text-right px-3 py-1 border-b border-gray-100 tabular-nums text-gray-800">
                  {d.value.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
