import React from 'react';
import type { NetConfig } from './types';
import { CanvasPanel, SimpleViewerProvider } from 'react-iiif-vault';
import { CastANetOverlayAtlas } from './CastANetOverlayAtlas';

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
  // Avoid TS friction if `canvas` isn't typed on SimpleViewerProvider in this repo.
  const AnySimpleViewerProvider = SimpleViewerProvider as unknown as React.FC<any>;

  return (
    <div style={{ border: '1px solid #ddd', height: 520, position: 'relative', background: '#fff' }}>
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
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

      <AnySimpleViewerProvider manifest={manifestId} canvas={canvasId}>
        <CanvasPanel.Viewer runtimeOptions={{ visibilityRatio: 1, maxUnderZoom: 1 }}>
          <CanvasPanel.RenderCanvas>
            <CastANetOverlayAtlas
              value={value}
              onChange={onChange}
              disabled={disabled}
              activeCell={activeCell}
              dimOpacity={dimOpacity}
            />
          </CanvasPanel.RenderCanvas>
        </CanvasPanel.Viewer>
      </AnySimpleViewerProvider>
    </div>
  );
};
