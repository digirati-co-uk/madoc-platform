import React, { useEffect, useRef, useState } from 'react';
import type { CastANetStructure, NetConfig, TabularCellRef } from './types';
import { CanvasPanel, SimpleViewerProvider } from 'react-iiif-vault';
import { CastANetOverlayAtlas } from './CastANetOverlayAtlas';
import { buildCastANetStructure } from './CastANetStructure';
import { CanvasViewerButton, CanvasViewerControls } from '../../../../shared/atoms/CanvasViewerGrid';
import { HomeIcon } from '../../../../shared/icons/HomeIcon';
import { MinusIcon } from '../../../../shared/icons/MinusIcon';
import { OpacityIcon } from '../../../../shared/icons/OpacityIcon';
import { PlusIcon } from '../../../../shared/icons/PlusIcon';
import { NET_DIM_STEP, NET_MAX_DIM_OPACITY, clampDimOpacity, dimOpacityToPercent } from './utils';
import './CastANetCanvas.css';

type CastANetCanvasProps = {
  manifestId: string;
  canvasId?: string;
  value: NetConfig;
  onChange: (next: NetConfig) => void;
  height?: number;
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
  height = 520,
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
  const sliderPositionValue = NET_MAX_DIM_OPACITY - safeDim;
  const sliderPositionPercent = Math.round((sliderPositionValue / NET_MAX_DIM_OPACITY) * 100);
  const sliderStyle = {
    '--cast-a-net-opacity-progress': `${sliderPositionPercent}%`,
  } as React.CSSProperties;

  const setDim = (next: number) => {
    const clamped = clampDimOpacity(next);
    setInternalDimOpacity(clamped);
    onChangeDimOpacity?.(clamped);
  };

  return (
    <div style={{ border: '1px solid #ddd', height, position: 'relative', background: '#fff' }}>
      <div className="cast-a-net-opacity-control" role="group" aria-label="Canvas opacity">
        <OpacityIcon className="cast-a-net-opacity-icon" aria-hidden="true" />
        <input
          type="range"
          aria-label="Canvas opacity"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={dimPercent}
          aria-valuetext={`${dimPercent}%`}
          min={0}
          max={NET_MAX_DIM_OPACITY}
          step={NET_DIM_STEP}
          value={sliderPositionValue}
          disabled={disabled}
          onChange={e => setDim(NET_MAX_DIM_OPACITY - Number(e.target.value))}
          className="cast-a-net-opacity-slider"
          style={sliderStyle}
        />
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

      <AnySimpleViewerProvider manifest={manifestId} startCanvas={canvasId}>
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
