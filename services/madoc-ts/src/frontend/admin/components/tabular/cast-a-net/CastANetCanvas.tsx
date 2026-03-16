import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CastANetStructure, NetConfig, TabularCellRef } from './types';
import { CanvasPanel, SimpleViewerProvider } from 'react-iiif-vault';
import { CastANetOverlayAtlas } from './CastANetOverlayAtlas';
import { buildCastANetStructure } from './CastANetStructure';
import { FollowActiveCellOnCanvas, type RuntimeWithViewport } from './FollowActiveCellOnCanvas';
import { OpacityIcon } from '../../../../shared/icons/OpacityIcon';
import { TabularCanvasViewportControls } from '../../../../shared/components/TabularCanvasViewportControls';
import { CanvasViewerButton } from '../../../../shared/atoms/CanvasViewerGrid';
import { ArrowDownIcon } from '../../../../shared/icons/ArrowDownIcon';
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
  previewOverlayOnly?: boolean;
  showVerticalNudgeControls?: boolean;
  onNudgeUp?: () => void;
  onNudgeDown?: () => void;
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
  previewOverlayOnly,
  showVerticalNudgeControls = false,
  onNudgeUp,
  onNudgeDown,
}) => {
  const AnySimpleViewerProvider = SimpleViewerProvider as unknown as React.FC<any>;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const runtime = useRef<RuntimeWithViewport | null>(null);
  const [internalDimOpacity, setInternalDimOpacity] = useState(0);
  const [runtimeTick, setRuntimeTick] = useState(0);
  const [overlayRetryToken, setOverlayRetryToken] = useState(0);
  const overlayRetryCountRef = useRef(0);
  const missingOverlayTicksRef = useRef(0);
  const initialZoomAppliedRef = useRef(false);
  const initialZoomRetryCountRef = useRef(0);
  const initialZoomFrameRef = useRef<number | null>(null);
  const viewerBaseKey = `${manifestId}::${canvasId ?? ''}`;
  const maxOverlayRetries = 4;
  const maxInitialZoomRetries = 20;
  const healthCheckIntervalMs = 500;
  const overlayMissingRetryTicks = 2;
  const INITIAL_CANVAS_ZOOM_FACTOR = 0.76;
  const viewerName = useMemo(
    () => `cast-a-net::${previewOverlayOnly ? 'preview' : 'edit'}::${manifestId}::${canvasId ?? 'default'}`,
    [canvasId, manifestId, previewOverlayOnly]
  );

  useEffect(() => {
    if (typeof dimOpacity === 'number') {
      setInternalDimOpacity(clampDimOpacity(dimOpacity));
    }
  }, [dimOpacity]);

  const cancelInitialZoomRetry = useCallback(() => {
    if (typeof window !== 'undefined' && initialZoomFrameRef.current != null) {
      window.cancelAnimationFrame(initialZoomFrameRef.current);
    }
    initialZoomFrameRef.current = null;
  }, []);

  useEffect(() => {
    runtime.current = null;
    initialZoomAppliedRef.current = false;
    initialZoomRetryCountRef.current = 0;
    cancelInitialZoomRetry();
    missingOverlayTicksRef.current = 0;
    overlayRetryCountRef.current = 0;
    setOverlayRetryToken(0);
  }, [viewerBaseKey, canvasId, cancelInitialZoomRetry]);

  useEffect(() => {
    return () => {
      cancelInitialZoomRetry();
    };
  }, [cancelInitialZoomRetry]);

  const getContainerSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return null;
    }

    const rect = container.getBoundingClientRect();
    const width = Math.round(rect.width);
    const containerHeight = Math.round(rect.height);

    if (width <= 0 || containerHeight <= 0) {
      return null;
    }

    return { width, height: containerHeight };
  }, []);

  const resizeRuntimeToSize = useCallback((nextSize: { width: number; height: number }) => {
    const currentRuntime = runtime.current;
    if (!currentRuntime) {
      return;
    }

    if (typeof currentRuntime.updateRendererScreenPosition === 'function') {
      currentRuntime.updateRendererScreenPosition();
    }

    if (currentRuntime.renderer?.resize) {
      currentRuntime.renderer.resize(nextSize.width, nextSize.height);
    }

    currentRuntime.updateNextFrame?.();
  }, []);

  const applyInitialZoom = useCallback(() => {
    const currentRuntime = runtime.current;
    if (!currentRuntime || initialZoomAppliedRef.current) {
      return false;
    }

    if (typeof currentRuntime.getViewport === 'function' && typeof currentRuntime.setViewport === 'function') {
      const viewport = currentRuntime.getViewport();
      if (!viewport || viewport.width <= 0 || viewport.height <= 0) {
        return false;
      }

      const nextWidth = viewport.width * INITIAL_CANVAS_ZOOM_FACTOR;
      const nextHeight = viewport.height * INITIAL_CANVAS_ZOOM_FACTOR;
      const nextX = viewport.x + (viewport.width - nextWidth) / 2;
      const nextY = viewport.y;
      currentRuntime.setViewport({
        x: nextX,
        y: nextY,
        width: nextWidth,
        height: nextHeight,
      });
    } else if (currentRuntime.world?.zoomIn) {
      currentRuntime.world?.zoomIn?.();
    } else {
      return false;
    }

    currentRuntime.updateNextFrame?.();
    initialZoomAppliedRef.current = true;
    return true;
  }, []);

  const scheduleInitialZoom = useCallback(() => {
    if (initialZoomAppliedRef.current) {
      return;
    }

    if (typeof window === 'undefined') {
      applyInitialZoom();
      return;
    }

    cancelInitialZoomRetry();
    initialZoomRetryCountRef.current = 0;

    const attemptApply = () => {
      if (applyInitialZoom()) {
        initialZoomFrameRef.current = null;
        return;
      }

      if (initialZoomRetryCountRef.current >= maxInitialZoomRetries) {
        initialZoomFrameRef.current = null;
        return;
      }

      initialZoomRetryCountRef.current += 1;
      initialZoomFrameRef.current = window.requestAnimationFrame(attemptApply);
    };

    initialZoomFrameRef.current = window.requestAnimationFrame(attemptApply);
  }, [applyInitialZoom, cancelInitialZoomRetry, maxInitialZoomRetries]);

  const remountOverlayLayer = useCallback(() => {
    if (previewOverlayOnly || overlayRetryCountRef.current >= maxOverlayRetries) {
      return;
    }

    missingOverlayTicksRef.current = 0;
    overlayRetryCountRef.current += 1;
    setOverlayRetryToken(token => token + 1);
    runtime.current?.updateNextFrame?.();
  }, [maxOverlayRetries, previewOverlayOnly]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const applyFromElement = () => {
      const size = getContainerSize();
      if (size) {
        resizeRuntimeToSize(size);
      }
    };

    let frameHandle: number | null = null;
    const observer = new ResizeObserver(() => {
      if (frameHandle != null) {
        window.cancelAnimationFrame(frameHandle);
      }

      frameHandle = window.requestAnimationFrame(() => {
        applyFromElement();
        frameHandle = null;
      });
    });

    observer.observe(container);
    applyFromElement();

    return () => {
      observer.disconnect();
      if (frameHandle != null) {
        window.cancelAnimationFrame(frameHandle);
      }
    };
  }, [getContainerSize, resizeRuntimeToSize]);

  const hasRenderedCanvas = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return false;
    }

    const canvases = Array.from(container.querySelectorAll('canvas'));
    if (!canvases.length) {
      return false;
    }

    return canvases.some(canvas => {
      const rect = canvas.getBoundingClientRect();
      return canvas.width > 0 && canvas.height > 0 && rect.width > 0 && rect.height > 0;
    });
  }, []);

  const hasRenderedOverlay = useCallback(() => {
    if (previewOverlayOnly) {
      return true;
    }

    const container = containerRef.current;
    if (!container) {
      return false;
    }

    return Boolean(container.querySelector('[data-cast-a-net-overlay="true"]'));
  }, [previewOverlayOnly]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const interval = window.setInterval(() => {
      const size = getContainerSize();
      if (!size) {
        return;
      }

      if (!runtime.current) {
        return;
      }

      if (!hasRenderedCanvas()) {
        // Canvas can be briefly absent while atlas settles after navigation/resize.
        resizeRuntimeToSize(size);
        runtime.current.updateNextFrame?.();
        return;
      }

      if (hasRenderedOverlay()) {
        missingOverlayTicksRef.current = 0;
        overlayRetryCountRef.current = 0;
        return;
      }

      missingOverlayTicksRef.current += 1;
      if (missingOverlayTicksRef.current >= overlayMissingRetryTicks) {
        remountOverlayLayer();
      }
    }, healthCheckIntervalMs);

    return () => window.clearInterval(interval);
  }, [
    getContainerSize,
    hasRenderedCanvas,
    hasRenderedOverlay,
    healthCheckIntervalMs,
    overlayMissingRetryTicks,
    remountOverlayLayer,
    resizeRuntimeToSize,
  ]);

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
  const zoomFromWheel = useCallback(
    (deltaY: number) => {
      if (disabled) {
        return;
      }

      if (deltaY < 0) {
        runtime.current?.world?.zoomIn?.();
      } else if (deltaY > 0) {
        runtime.current?.world?.zoomOut?.();
      }
    },
    [disabled]
  );
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
  const viewerKey = viewerBaseKey;

  return (
    <div
      className="cast-a-net-canvas relative flex min-h-0 flex-col overflow-hidden border border-[#ddd] bg-white"
      ref={containerRef}
      style={{ height }}
    >
      {!previewOverlayOnly ? (
        <div
          className="absolute left-3 top-3 z-50 flex w-[min(210px,calc(100%-120px))] min-w-[140px] max-w-[210px] items-center gap-1.5 rounded-[7px] border border-[#cfd2db] bg-[rgba(236,236,241,0.96)] px-2 py-1.5 max-[1100px]:w-[min(170px,calc(100%-112px))] max-[1100px]:min-w-[120px] max-[1100px]:max-w-[170px] max-[1100px]:px-[7px] max-[1100px]:py-[5px]"
          role="group"
          aria-label="Canvas opacity"
        >
          <OpacityIcon
            className="h-4 w-4 shrink-0 text-[#3f3f46] max-[1100px]:h-3.5 max-[1100px]:w-3.5"
            aria-hidden="true"
          />
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
      ) : null}

      <TabularCanvasViewportControls
        onHome={goHome}
        onZoomOut={zoomOut}
        onZoomIn={zoomIn}
        homeDisabled={disabled}
        zoomOutDisabled={disabled}
        zoomInDisabled={disabled}
        className="!right-3 !top-3 !z-50"
      />
      {showVerticalNudgeControls && (onNudgeUp || onNudgeDown) ? (
        <div className="absolute left-3 top-3 z-50 flex flex-col gap-2">
          <CanvasViewerButton type="button" onClick={onNudgeUp} disabled={disabled || !onNudgeUp} title="Nudge up">
            <ArrowDownIcon style={{ transform: 'rotate(180deg)', fill: 'currentColor' }} />
          </CanvasViewerButton>
          <CanvasViewerButton
            type="button"
            onClick={onNudgeDown}
            disabled={disabled || !onNudgeDown}
            title="Nudge down"
          >
            <ArrowDownIcon style={{ fill: 'currentColor' }} />
          </CanvasViewerButton>
        </div>
      ) : null}

      <AnySimpleViewerProvider key={viewerKey} manifest={manifestId} startCanvas={canvasId}>
        <CanvasPanel.Viewer
          name={viewerName}
          height={height}
          resizeHash={height}
          updateViewportTimeout={180}
          runtimeOptions={{ maxOverZoom: 5, visibilityRatio: 1, maxUnderZoom: 1 }}
          onCreated={preset => {
            runtime.current = (preset.runtime as RuntimeWithViewport | null) ?? null;
            setRuntimeTick(tick => tick + 1);
            const size = getContainerSize();
            if (size) {
              resizeRuntimeToSize(size);
            }
            scheduleInitialZoom();
          }}
        >
          <FollowActiveCellOnCanvas
            runtimeRef={runtime}
            runtimeTick={runtimeTick}
            value={value}
            activeCell={activeCell}
            enabled={previewOverlayOnly && !!activeCell}
          />
          <CanvasPanel.RenderCanvas>
            <CastANetOverlayAtlas
              key={`overlay::${overlayRetryToken}`}
              value={value}
              onChange={onChange}
              disabled={disabled}
              activeCell={activeCell}
              dimOpacity={safeDim}
              previewOverlayOnly={previewOverlayOnly}
              onOverlayWheel={zoomFromWheel}
            />
          </CanvasPanel.RenderCanvas>
        </CanvasPanel.Viewer>
      </AnySimpleViewerProvider>
    </div>
  );
};
