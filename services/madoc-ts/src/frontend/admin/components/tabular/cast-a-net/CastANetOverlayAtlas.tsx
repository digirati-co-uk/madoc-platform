import React from 'react';
import { HTMLPortal } from '@atlas-viewer/atlas';
import { useCanvas } from 'react-iiif-vault';
import type { NetConfig, TabularCellRef } from './types';
import { clampDimOpacity } from './utils';
import { CastANetOverlay } from './CastANetOverlay';

type CastANetOverlayAtlasProps = {
  value: NetConfig;
  onChange: (next: NetConfig) => void;
  disabled?: boolean;
  activeCell?: TabularCellRef | null;
  dimOpacity?: number;
};

export function CastANetOverlayAtlas({
  value,
  onChange,
  disabled,
  activeCell,
  dimOpacity = 0,
}: CastANetOverlayAtlasProps) {
  const canvas = useCanvas();
  if (!canvas) return null;

  const dim = clampDimOpacity(dimOpacity);

  return (
    <HTMLPortal target={{ x: 0, y: 0, width: canvas.width, height: canvas.height }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        {dim > 0 ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#fff',
              opacity: dim,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        ) : null}

        {/* Net overlay */}
        <CastANetOverlay value={value} onChange={onChange} disabled={disabled} activeCell={activeCell} />
      </div>
    </HTMLPortal>
  );
}
