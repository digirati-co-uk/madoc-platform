import React, { useId } from 'react';
import { useChartInteraction } from './use-chart-interaction';

interface MiniSparklineProps {
  values: number[];
  /** ISO date strings matching values, used for tooltip label */
  dates?: string[];
  label: string;
  color?: string;
  width?: number;
  height?: number;
}

export function MiniSparkline({
  values,
  dates,
  label,
  color = '#4157bb',
  width = 120,
  height = 48,
}: MiniSparklineProps) {
  const uid = useId();
  const { activeIndex: activeIdx, handlers } = useChartInteraction(values.length, true);

  if (values.length === 0) return null;

  const max = Math.max(...values, 1);
  const padX = 2;
  const padY = 4;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const pointCount = values.length;

  const coords = values.map((v, i) => {
    const x = padX + (pointCount === 1 ? innerW / 2 : (i / (pointCount - 1)) * innerW);
    const y = padY + innerH - (v / max) * innerH;
    return { x, y };
  });

  // Polyline points string
  const polylinePoints = coords.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Area fill path: line + close to bottom
  const areaPath = [
    `M ${coords[0].x.toFixed(1)},${(padY + innerH).toFixed(1)}`,
    ...coords.map(p => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `L ${coords[coords.length - 1].x.toFixed(1)},${(padY + innerH).toFixed(1)}`,
    'Z',
  ].join(' ');

  const fillId = `${uid}-fill`;

  const activeCoord = activeIdx !== null ? coords[activeIdx] : null;
  const activeValue = activeIdx !== null ? values[activeIdx] : null;
  const activeDate = activeIdx !== null && dates ? dates[activeIdx] : null;

  // Tooltip position in percent of svg viewBox width
  const tooltipXPct = activeCoord ? (activeCoord.x / width) * 100 : 0;

  return (
    <div className="relative" style={{ width, height }}>
      <p id={`${uid}-help`} className="sr-only">
        Use left and right arrow keys to explore dates, Home or End to jump, and Escape to dismiss details.
      </p>
      <p id={`${uid}-detail`} className="sr-only" aria-live="polite" aria-atomic="true">
        {activeIdx === null ? '' : `${activeDate || ''}: ${activeValue?.toLocaleString()} views`}
      </p>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-roledescription="interactive chart"
        aria-describedby={`${uid}-help ${uid}-detail`}
        tabIndex={0}
        aria-label={label}
        className="cursor-crosshair block rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4157bb]"
        {...handlers}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        {pointCount >= 2 && <path d={areaPath} fill={`url(#${fillId})`} />}

        {/* Line */}
        {pointCount >= 2 ? (
          <polyline
            points={polylinePoints}
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : (
          /* Single point: draw a dot */
          <circle cx={coords[0].x} cy={coords[0].y} r="3" fill={color} />
        )}

        {/* Last-point dot */}
        {pointCount >= 2 && (
          <circle
            cx={coords[coords.length - 1].x}
            cy={coords[coords.length - 1].y}
            r="2.5"
            fill={color}
            opacity="0.9"
          />
        )}

        {/* Hover crosshair dot */}
        {activeCoord !== null && (
          <circle cx={activeCoord.x} cy={activeCoord.y} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
        )}
      </svg>

      {/* HTML tooltip — natural size, no SVG text stretch */}
      {activeIdx !== null && activeValue !== null && (
        <div
          className="pointer-events-none absolute z-10 bg-[#24386b] text-white text-xs rounded px-1.5 py-1 shadow-md"
          style={{
            left: `clamp(3rem, ${tooltipXPct}%, calc(100% - 3rem))`,
            width: '6rem',
            textAlign: 'center',
            bottom: '100%',
            transform: 'translateX(-50%)',
            marginBottom: 4,
            whiteSpace: 'nowrap',
          }}
          role="tooltip"
        >
          {activeDate && <div className="text-white/70">{activeDate}</div>}
          <div className="tabular-nums font-medium">{activeValue.toLocaleString()} views</div>
        </div>
      )}
    </div>
  );
}
