import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { DragMode, NetConfig } from './types';
import { type PxRect, clamp, normalisePositions, getRelativeRect, getStops } from './utils';

type CastANetOverlayProps = {
  value: NetConfig;
  onChange: (next: NetConfig) => void;
  disabled?: boolean;
  background: React.ReactNode;
  coordinateSpaceRef?: React.RefObject<HTMLElement>;
  activeCell?: { row: number; col: number } | null;
};

export const CastANetOverlay: React.FC<CastANetOverlayProps> = ({
  value,
  onChange,
  disabled = false,
  background,
  coordinateSpaceRef,
  activeCell,
}) => {
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

  const [coordRect, setCoordRect] = useState<PxRect | null>(null);

  useLayoutEffect(() => {
    if (!overlayRef.current) return;

    const update = () => {
      const overlayEl = overlayRef.current!;
      const targetEl = coordinateSpaceRef?.current;

      if (targetEl) {
        setCoordRect(getRelativeRect(overlayEl, targetEl));
      } else {
        const r = overlayEl.getBoundingClientRect();
        setCoordRect({ left: 0, top: 0, width: r.width, height: r.height });
      }
    };

    update();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (ro) {
      ro.observe(overlayRef.current);
      if (coordinateSpaceRef?.current) ro.observe(coordinateSpaceRef.current);
    }

    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      if (ro) ro.disconnect();
    };
  }, [coordinateSpaceRef]);

  const coordRectForEvents = useMemo(() => {
    if (!overlayRef.current) return null;
    if (coordRect) return coordRect;
    const r = overlayRef.current.getBoundingClientRect();
    return { left: 0, top: 0, width: r.width, height: r.height } as PxRect;
  }, [coordRect]);

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

  const startDrag = (mode: DragMode) => (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    if (!overlayRef.current) return;
    const rect = coordRectForEvents;
    if (!rect) return;

    const overlayBcr = overlayRef.current.getBoundingClientRect();
    const x = ((e.clientX - (overlayBcr.left + rect.left)) / rect.width) * 100;
    const y = ((e.clientY - (overlayBcr.top + rect.top)) / rect.height) * 100;

    dragModeRef.current = mode;
    dragStartRef.current = { x, y, config: value, shiftKey: e.shiftKey };

    // Track dragging globally so the viewer controls remain usable.
    const onWindowMove = (ev: MouseEvent) => {
      if (disabled) return;
      if (!overlayRef.current) return;
      if (!dragModeRef.current || !dragStartRef.current) return;

      const rect = coordRectForEvents;
      if (!rect) return;

      const overlayBcr = overlayRef.current.getBoundingClientRect();
      const currentX = ((ev.clientX - (overlayBcr.left + rect.left)) / rect.width) * 100;
      const currentY = ((ev.clientY - (overlayBcr.top + rect.top)) / rect.height) * 100;

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

    const onWindowUp = () => {
      endDrag();
    };

    if (windowMoveHandlerRef.current) window.removeEventListener('mousemove', windowMoveHandlerRef.current);
    if (windowUpHandlerRef.current) window.removeEventListener('mouseup', windowUpHandlerRef.current);

    windowMoveHandlerRef.current = onWindowMove;
    windowUpHandlerRef.current = onWindowUp;

    window.addEventListener('mousemove', onWindowMove);
    window.addEventListener('mouseup', onWindowUp);
  };

  const endDrag = () => {
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
  };

  return (
    <div ref={overlayRef} style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'auto',
        }}
      >
        {background}
      </div>

      {/* Coordinate-space layer (matches the rendered canvas area) */}
      <div
        style={{
          position: 'absolute',
          left: coordRect?.left ?? 0,
          top: coordRect?.top ?? 0,
          width: coordRect?.width ?? '100%',
          height: coordRect?.height ?? '100%',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        {/* Net box */}
        <div
          onMouseDown={startDrag('move')}
          style={{
            position: 'absolute',
            top: `${value.top}%`,
            left: `${value.left}%`,
            width: `${value.width}%`,
            height: `${value.height}%`,
            border: '2px solid #4A64E1',
            boxSizing: 'border-box',
            cursor: disabled ? 'not-allowed' : 'move',
            userSelect: 'none',
            pointerEvents: 'auto',
          }}
        >
          {(() => {
            const rowStops = getStops(value.rows, value.rowPositions);
            const colStops = getStops(value.cols, value.colPositions);
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
              const rowStops = getStops(value.rows, value.rowPositions);
              const colStops = getStops(value.cols, value.colPositions);
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
                height: 2,
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
                width: 2,
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
                  width: 12,
                  height: 12,
                  background: '#4A64E1',
                  borderRadius: 2,
                  ...styleByCorner[corner],
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
