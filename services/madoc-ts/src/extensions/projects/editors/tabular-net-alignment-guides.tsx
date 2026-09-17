import React, { useRef } from 'react';
import { fitTabularAlignment } from '@/frontend/shared/utility/tabular-heading-home';
import { HTMLPortal, useAfterFrame, useRuntime } from '@atlas-viewer/atlas';
import { useCanvas } from 'react-iiif-vault';
import type { NetConfig } from '@/frontend/shared/utility/tabular-types';
import { getEffectivePositions } from '@/frontend/admin/components/tabular/cast-a-net/utils';
import {
  moveAlignmentEdge,
  type TabularHorizontalAlignment,
} from '@/frontend/shared/utility/tabular-horizontal-alignment';

interface TabularNetAlignmentGuidesProps {
  value: NetConfig;
  onChange: (value: TabularHorizontalAlignment) => void;
}

export function TabularNetAlignmentGuides({ value, onChange }: TabularNetAlignmentGuidesProps) {
  const canvas = useCanvas();
  const runtime = useRuntime();
  const lastSize = useRef('');
  useAfterFrame(() => {
    const screen = runtime?.getRendererScreenPosition();
    if (!screen?.width || !screen.height) return;
    const size = `${screen.width}:${screen.height}`;
    if (size !== lastSize.current && fitTabularAlignment(runtime, value)) lastSize.current = size;
  }, [runtime, value]);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ edge: 'left' | 'right'; start: TabularHorizontalAlignment } | null>(null);
  if (!canvas) return null;

  return (
    <HTMLPortal relative target={{ x: 0, y: 0, width: canvas.width, height: canvas.height }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0"
        style={{ zIndex: 12 }}
        aria-hidden="true"
      >
        {getEffectivePositions(value.cols, value.colPositions).map((position, index) => (
          <line
            key={index}
            x1={value.left + (position / 100) * value.width}
            x2={value.left + (position / 100) * value.width}
            y1={value.top}
            y2={100}
            stroke="#2563eb"
            strokeOpacity={0.65}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {(['left', 'right'] as const).map(edge => {
          const position = edge === 'left' ? value.left : value.left + value.width;
          return (
            <g key={edge}>
              <line
                x1={position}
                x2={position}
                y1={0}
                y2={100}
                stroke={edge === 'left' ? '#2563eb' : '#c2410c'}
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={position}
                x2={position}
                y1={0}
                y2={100}
                stroke="transparent"
                strokeWidth={24}
                vectorEffect="non-scaling-stroke"
                style={{ pointerEvents: 'stroke', cursor: 'ew-resize', touchAction: 'none' }}
                onPointerDown={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  dragRef.current = { edge, start: value };
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={event => {
                  const drag = dragRef.current;
                  const bounds = svgRef.current?.getBoundingClientRect();
                  if (!drag || !bounds?.width) return;
                  event.stopPropagation();
                  onChange(
                    moveAlignmentEdge(drag.start, drag.edge, ((event.clientX - bounds.left) / bounds.width) * 100)
                  );
                }}
                onPointerUp={event => {
                  dragRef.current = null;
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }}
                onLostPointerCapture={() => {
                  dragRef.current = null;
                }}
              />
            </g>
          );
        })}
      </svg>
    </HTMLPortal>
  );
}
