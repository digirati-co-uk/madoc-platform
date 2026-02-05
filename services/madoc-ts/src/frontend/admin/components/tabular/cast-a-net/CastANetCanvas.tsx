import React, { useEffect, useRef, useState } from 'react';
import type { CastANetStructure, NetConfig, TabularCellRef } from './types';
import { CanvasPanel, SimpleViewerProvider } from 'react-iiif-vault';
import { CastANetOverlayAtlas } from './CastANetOverlayAtlas';
import { buildCastANetStructure } from './CastANetStructure';
import { CanvasViewerButton, CanvasViewerControls } from '../../../../shared/atoms/CanvasViewerGrid';
import { HomeIcon } from '../../../../shared/icons/HomeIcon';
import { MinusIcon } from '../../../../shared/icons/MinusIcon';
import { PlusIcon } from '../../../../shared/icons/PlusIcon';
import { NET_DIM_STEP, NET_MAX_DIM_OPACITY, clampDimOpacity, dimOpacityToPercent } from './utils';

type CastANetCanvasProps = {
  manifestId: string;
  canvasId?: string;
  value: NetConfig;
  onChange: (next: NetConfig) => void;
  onStructureChange?: (next: CastANetStructure) => void;
  blankColumnIndexes?: number[];
  disabled?: boolean;
  dimOpacity?: number;
  onChangeDimOpacity?: (next: number) => void;
  activeCell?: TabularCellRef | null;
};

export const CastANetCanvas: React.FC<CastANetCanvasProps> = ({
  manifestId,
  canvasId,
  value,
  onChange,
  onStructureChange,
  blankColumnIndexes,
  disabled,
  dimOpacity,
  onChangeDimOpacity,
  activeCell,
}) => {
  const AnySimpleViewerProvider = SimpleViewerProvider as unknown as React.FC<any>;
  const runtime = useRef<any>(null);
  const [internalDimOpacity, setInternalDimOpacity] = useState(0);

  useEffect(() => {
    if (typeof dimOpacity === 'number') {
      setInternalDimOpacity(clampDimOpacity(dimOpacity));
    }
  }, [dimOpacity]);

  useEffect(() => {
    if (!onStructureChange) return;
    onStructureChange(
      buildCastANetStructure(value, {
        blankColumnIndexes,
      })
    );
  }, [value, blankColumnIndexes, onStructureChange]);

  const goHome = () => runtime.current?.world?.goHome?.();
  const zoomIn = () => runtime.current?.world?.zoomIn?.();
  const zoomOut = () => runtime.current?.world?.zoomOut?.();
  const resolvedDimOpacity = typeof dimOpacity === 'number' ? dimOpacity : internalDimOpacity;
  const safeDim = clampDimOpacity(resolvedDimOpacity);
  const dimPercent = dimOpacityToPercent(safeDim);

  const setDim = (next: number) => {
    const clamped = clampDimOpacity(next);
    setInternalDimOpacity(clamped);
    onChangeDimOpacity?.(clamped);
  };

  return (
    <div style={{ border: '1px solid #ddd', height: 520, position: 'relative', background: '#fff' }}>
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 50,
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: '10px 12px',
          display: 'grid',
          gap: 8,
          minWidth: 220,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600, opacity: 0.95 }}>Canvas opacity</label>
          <span
            style={{
              fontSize: 11,
              border: '1px solid #d4d4d8',
              borderRadius: 999,
              padding: '2px 8px',
              background: '#fff',
            }}
          >
            {dimPercent}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={NET_MAX_DIM_OPACITY}
          step={NET_DIM_STEP}
          value={safeDim}
          disabled={disabled}
          onChange={e => setDim(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#4A64E1' }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setDim(0)}
            disabled={disabled}
            style={{
              border: '1px solid #d4d4d8',
              background: '#fff',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 12,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setDim(safeDim - NET_DIM_STEP)}
            disabled={disabled}
            style={{
              border: '1px solid #d4d4d8',
              background: '#fff',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 12,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            -5%
          </button>
          <button
            type="button"
            onClick={() => setDim(safeDim + NET_DIM_STEP)}
            disabled={disabled}
            style={{
              border: '1px solid #d4d4d8',
              background: '#fff',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 12,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            +5%
          </button>
        </div>
      </div>

      <CanvasViewerControls style={{ top: 12, right: 12, zIndex: 50 }}>
        <CanvasViewerButton type="button" title="Home" onClick={goHome} disabled={disabled}>
          <HomeIcon />
        </CanvasViewerButton>
        <CanvasViewerButton type="button" title="Zoom out" onClick={zoomOut} disabled={disabled}>
          <MinusIcon />
        </CanvasViewerButton>
        <CanvasViewerButton type="button" title="Zoom in" onClick={zoomIn} disabled={disabled}>
          <PlusIcon />
        </CanvasViewerButton>
      </CanvasViewerControls>

      <AnySimpleViewerProvider manifest={manifestId} canvas={canvasId}>
        <CanvasPanel.Viewer
          runtimeOptions={{ maxOverZoom: 5, visibilityRatio: 1, maxUnderZoom: 1 }}
          onCreated={(preset: any) => {
            runtime.current = preset.runtime;
          }}
        >
          <CanvasPanel.RenderCanvas>
            <CastANetOverlayAtlas
              value={value}
              onChange={onChange}
              disabled={disabled}
              activeCell={activeCell}
              dimOpacity={safeDim}
            />
          </CanvasPanel.RenderCanvas>
        </CanvasPanel.Viewer>
      </AnySimpleViewerProvider>
    </div>
  );
};
