import React, { useEffect, useRef } from 'react';
import type { NetConfig } from './types';
import { CanvasPanel } from 'react-iiif-vault';
import { CastANetOverlay } from './CastANetOverlay';
import { clamp, findCanvasPanelContentElement } from './utils';

type CastANetCanvasProps = {
  manifestId: string;
  canvasId?: string;
  value: NetConfig;
  onChange: (next: NetConfig) => void;
  disabled?: boolean;
  dimOpacity?: number;
  onChangeDimOpacity?: (next: number) => void;
  activeCell?: { row: number; col: number } | null;
};

export const CastANetCanvas: React.FC<CastANetCanvasProps> = ({
  manifestId,
  canvasId,
  value,
  onChange,
  disabled,
  dimOpacity = 0,
  onChangeDimOpacity,
  activeCell,
}) => {
  const viewerHostRef = useRef<HTMLDivElement | null>(null);
  const coordinateSpaceRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const tick = () => {
      if (cancelled) return;
      attempts++;

      const host = viewerHostRef.current;
      if (!host) return;

      const canvasPanelEl =
        (host.querySelector('canvas-panel') as HTMLElement | null) ||
        (host.querySelector('[data-canvas-panel]') as HTMLElement | null);

      const contentEl = findCanvasPanelContentElement(canvasPanelEl || host);
      if (contentEl) {
        coordinateSpaceRef.current = contentEl;
        return;
      }

      if (attempts < 30) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return () => {
      cancelled = true;
    };
  }, [manifestId, canvasId]);

  return (
    <div style={{ border: '1px solid #ddd', height: 520, position: 'relative', background: '#fff' }}>
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 5,
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <label style={{ fontSize: 12, opacity: 0.9 }}>Canvas opacity</label>
        <input
          type="range"
          min={0}
          max={0.85}
          step={0.05}
          value={dimOpacity}
          onChange={e => onChangeDimOpacity?.(Number(e.target.value))}
          style={{ width: 140 }}
        />
      </div>

      <div ref={viewerHostRef} style={{ width: '100%', height: '100%' }}>
        <CastANetOverlay
          value={value}
          onChange={onChange}
          disabled={disabled}
          activeCell={activeCell}
          coordinateSpaceRef={coordinateSpaceRef as unknown as React.RefObject<HTMLElement>}
          background={
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                opacity: 1 - clamp(dimOpacity, 0, 0.85),
              }}
            >
              <CanvasPanel
                key={`${manifestId}:${canvasId ?? ''}`}
                {...({ manifest: manifestId, canvas: canvasId } as any)}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>
          }
        />
      </div>
    </div>
  );
};
