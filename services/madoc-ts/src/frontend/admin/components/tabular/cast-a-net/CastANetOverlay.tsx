import React, { useCallback, useMemo, useRef } from 'react';
import type { DragMode, NetConfig } from './types';
import { clamp, normalisePositions, getStops } from './utils';

type CastANetOverlayProps = {
  value: NetConfig;
  onChange: (next: NetConfig) => void;
  disabled?: boolean;
  activeCell?: { row: number; col: number } | null;
};

export const CastANetOverlay: React.FC<CastANetOverlayProps> = ({ value, onChange, disabled = false, activeCell }) => {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dragModeRef = useRef<DragMode>(null);
  const dragStartRef = useRef<{
    x: number;
    y: number;
    config: NetConfig;
    shiftKey: boolean;
  } | null>(null);
  const windowMoveHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const windowUpHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);

  const emitChange = useCallback(
    (next: NetConfig) => {
      const minSize = 5;
      const top = clamp(next.top, 0, 100 - minSize);
      const left = clamp(next.left, 0, 100 - minSize);
      const width = clamp(next.width, minSize, 100 - left);
      const height = clamp(next.height, minSize, 100 - top);

      const rows = Math.max(1, Math.floor(next.rows));
      const cols = Math.max(1, Math.floor(next.cols));

      onChange({
        ...next,
        top,
        left,
        width,
        height,
        rows,
        cols,
        rowPositions: normalisePositions(next.rowPositions, rows),
        colPositions: normalisePositions(next.colPositions, cols),
      });
    },
    [onChange]
  );

  const endDrag = useCallback(() => {
    dragModeRef.current = null;
    dragStartRef.current = null;

    if (windowMoveHandlerRef.current) {
      window.removeEventListener('mousemove', windowMoveHandlerRef.current);
      windowMoveHandlerRef.current = null;
    }
    if (windowUpHandlerRef.current) {
      window.removeEventListener('mouseup', windowUpHandlerRef.current);
      windowUpHandlerRef.current = null;
    }
  }, []);

  const startDrag = (mode: DragMode) => (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();

    const el = overlayRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    dragModeRef.current = mode;
    dragStartRef.current = { x, y, config: value, shiftKey: e.shiftKey };

    const onWindowMove = (ev: MouseEvent) => {
      if (disabled) return;
      const elNow = overlayRef.current;
      if (!elNow) return;
      if (!dragModeRef.current || !dragStartRef.current) return;

      const rectNow = elNow.getBoundingClientRect();
      const currentX = ((ev.clientX - rectNow.left) / rectNow.width) * 100;
      const currentY = ((ev.clientY - rectNow.top) / rectNow.height) * 100;

      const modeNow = dragModeRef.current;
      const start = dragStartRef.current.config;

      const dx = currentX - dragStartRef.current.x;
      const dy = currentY - dragStartRef.current.y;

      const next: NetConfig = { ...start };

      if (modeNow === 'move') {
        next.left = start.left + dx;
        next.top = start.top + dy;
        emitChange(next);
        return;
      }

      if (modeNow === 'resize-nw') {
        next.left = start.left + dx;
        next.top = start.top + dy;
        next.width = start.width - dx;
        next.height = start.height - dy;
        emitChange(next);
        return;
      }
      if (modeNow === 'resize-ne') {
        next.top = start.top + dy;
        next.width = start.width + dx;
        next.height = start.height - dy;
        emitChange(next);
        return;
      }
      if (modeNow === 'resize-sw') {
        next.left = start.left + dx;
        next.width = start.width - dx;
        next.height = start.height + dy;
        emitChange(next);
        return;
      }
      if (modeNow === 'resize-se') {
        next.width = start.width + dx;
        next.height = start.height + dy;
        emitChange(next);
        return;
      }

      if (modeNow && typeof modeNow === 'object' && modeNow.type === 'row') {
        const idx = modeNow.index;
        const minGap = 2;
        const pointerInNet = clamp(((currentY - start.top) / start.height) * 100, 0, 100);

        if (!dragStartRef.current.shiftKey) {
          const prev = idx === 0 ? 0 : start.rowPositions[idx - 1];
          const nextPos = idx === start.rowPositions.length - 1 ? 100 : start.rowPositions[idx + 1];
          next.rowPositions = [...start.rowPositions];
          next.rowPositions[idx] = clamp(pointerInNet, prev + minGap, nextPos - minGap);
          emitChange(next);
          return;
        } else {
          const k = idx + 1;
          let step = pointerInNet / k;
          const maxStep = (100 - minGap) / (value.rows - 1);
          step = clamp(step, minGap, maxStep);
          next.rowPositions = Array.from({ length: value.rows - 1 }, (_, i) => step * (i + 1));
          emitChange(next);
          return;
        }
      }

      if (modeNow && typeof modeNow === 'object' && modeNow.type === 'col') {
        const idx = modeNow.index;
        const minGap = 2;
        const pointerInNet = clamp(((currentX - start.left) / start.width) * 100, 0, 100);

        if (!dragStartRef.current.shiftKey) {
          const prev = idx === 0 ? 0 : start.colPositions[idx - 1];
          const nextPos = idx === start.colPositions.length - 1 ? 100 : start.colPositions[idx + 1];
          next.colPositions = [...start.colPositions];
          next.colPositions[idx] = clamp(pointerInNet, prev + minGap, nextPos - minGap);
          emitChange(next);
          return;
        } else {
          const k = idx + 1;
          let step = pointerInNet / k;
          const maxStep = (100 - minGap) / (value.cols - 1);
          step = clamp(step, minGap, maxStep);
          next.colPositions = Array.from({ length: value.cols - 1 }, (_, i) => step * (i + 1));
          emitChange(next);
          return;
        }
      }
    };

    const onWindowUp = () => endDrag();

    if (windowMoveHandlerRef.current) window.removeEventListener('mousemove', windowMoveHandlerRef.current);
    if (windowUpHandlerRef.current) window.removeEventListener('mouseup', windowUpHandlerRef.current);

    windowMoveHandlerRef.current = onWindowMove;
    windowUpHandlerRef.current = onWindowUp;

    window.addEventListener('mousemove', onWindowMove);
    window.addEventListener('mouseup', onWindowUp);
  };

  const rowStops = useMemo(() => getStops(value.rows, value.rowPositions), [value.rows, value.rowPositions]);
  const colStops = useMemo(() => getStops(value.cols, value.colPositions), [value.cols, value.colPositions]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      <div
        onMouseDown={startDrag('move')}
        style={{
          position: 'absolute',
          top: `${value.top}%`,
          left: `${value.left}%`,
          width: `${value.width}%`,
          height: `${value.height}%`,
          border: '7px solid #4A64E1',
          boxSizing: 'border-box',
          cursor: disabled ? 'not-allowed' : 'move',
          userSelect: 'none',
          pointerEvents: 'auto',
        }}
      >
        {/* Pink header bar */}
        {(() => {
          const r0 = rowStops[0];
          const r1 = rowStops[1];
          if (r0 == null || r1 == null) return null;
          const h = r1 - r0;

          return (
            <div
              style={{
                position: 'absolute',
                top: `${r0}%`,
                left: 0,
                right: 0,
                height: `${h}%`,
                background: 'rgba(255, 105, 180, 0.25)',
                borderBottom: '2px solid rgba(255, 105, 180, 0.55)',
                pointerEvents: 'none',
              }}
            >
              {colStops.slice(1, -1).map((pos, i) => (
                <div
                  key={`head-col-${i}`}
                  style={{
                    position: 'absolute',
                    left: `${pos}%`,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: 'rgba(74, 100, 225, 0.9)',
                  }}
                />
              ))}
            </div>
          );
        })()}

        {/* Active cell highlight */}
        {activeCell &&
          (() => {
            const r0 = rowStops[activeCell.row];
            const r1 = rowStops[activeCell.row + 1];
            const c0 = colStops[activeCell.col];
            const c1 = colStops[activeCell.col + 1];
            if (r0 == null || r1 == null || c0 == null || c1 == null) return null;

            return (
              <div
                style={{
                  position: 'absolute',
                  top: `${r0}%`,
                  left: `${c0}%`,
                  width: `${c1 - c0}%`,
                  height: `${r1 - r0}%`,
                  background: 'rgba(74, 100, 225, 0.15)',
                  outline: '2px solid rgba(74, 100, 225, 0.6)',
                  pointerEvents: 'none',
                }}
              />
            );
          })()}

        {/* Row lines */}
        {value.rowPositions.map((pos, index) => (
          <div
            key={`row-${index}`}
            onMouseDown={e => {
              e.stopPropagation();
              startDrag({ type: 'row', index })(e);
            }}
            style={{
              position: 'absolute',
              top: `${pos}%`,
              left: 0,
              right: 0,
              height: 6,
              background: '#4A64E1',
              cursor: disabled ? 'not-allowed' : 'row-resize',
            }}
          />
        ))}

        {/* Column lines */}
        {value.colPositions.map((pos, index) => (
          <div
            key={`col-${index}`}
            onMouseDown={e => {
              e.stopPropagation();
              startDrag({ type: 'col', index })(e);
            }}
            style={{
              position: 'absolute',
              left: `${pos}%`,
              top: 0,
              bottom: 0,
              width: 6,
              background: '#4A64E1',
              cursor: disabled ? 'not-allowed' : 'col-resize',
            }}
          />
        ))}

        {/* Resize handles */}
        {(['nw', 'ne', 'sw', 'se'] as const).map(corner => {
          const styleByCorner: Record<typeof corner, React.CSSProperties> = {
            nw: { top: -6, left: -6, cursor: 'nwse-resize' },
            ne: { top: -6, right: -6, cursor: 'nesw-resize' },
            sw: { bottom: -6, left: -6, cursor: 'nesw-resize' },
            se: { bottom: -6, right: -6, cursor: 'nwse-resize' },
          };
          const mode: Record<typeof corner, DragMode> = {
            nw: 'resize-nw',
            ne: 'resize-ne',
            sw: 'resize-sw',
            se: 'resize-se',
          };

          return (
            <div
              key={corner}
              onMouseDown={e => {
                e.stopPropagation();
                startDrag(mode[corner])(e);
              }}
              style={{
                position: 'absolute',
                width: 24,
                height: 24,
                background: '#4A64E1',
                borderRadius: 2,
                ...styleByCorner[corner],
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
