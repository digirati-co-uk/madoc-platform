import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CastANetOverlayAtlas } from '@/frontend/admin/components/tabular/cast-a-net/CastANetOverlayAtlas';
import {
  FollowActiveCellOnCanvas,
  type RuntimeWithViewport,
} from '@/frontend/admin/components/tabular/cast-a-net/FollowActiveCellOnCanvas';
import type { NetConfig, TabularCellRef } from '@/frontend/shared/utility/tabular-types';
import {
  goHomeToTabularHeadings,
  setTabularHeadingsHomePosition,
} from '@/frontend/shared/utility/tabular-heading-home';
import { resizeAtlasRuntime } from '@/frontend/shared/utility/resize-atlas-runtime';
import { CanvasViewerButton } from '@/frontend/shared/atoms/CanvasViewerGrid';
import { EditorContentViewer } from '@/frontend/shared/capture-models/new/EditorContent';
import { ArrowDownIcon } from '@/frontend/shared/icons/ArrowDownIcon';
import { PanIcon } from '@/frontend/shared/icons/PanIcon';
import { TabularCanvasViewportControls } from '@/frontend/shared/components/TabularCanvasViewportControls';
import type { CanvasFull } from '@/types/canvas-full';

type TabularProjectCustomEditorCanvasProps = {
  canvasId: number;
  canvas?: CanvasFull['canvas'];
  netConfig: NetConfig | null;
  activeCell: TabularCellRef | null;
  zoomTrackingDefaultEnabled: boolean;
  showVerticalNudgeControls?: boolean;
  onNudgeUp?: () => void;
  onNudgeDown?: () => void;
  nudgeDisabled?: boolean;
};

export function TabularProjectCustomEditorCanvas({
  canvasId,
  canvas,
  netConfig,
  activeCell,
  zoomTrackingDefaultEnabled,
  showVerticalNudgeControls = false,
  onNudgeUp,
  onNudgeDown,
  nudgeDisabled = false,
}: TabularProjectCustomEditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<RuntimeWithViewport | null>(null);
  const [runtimeTick, setRuntimeTick] = useState(0);
  const [zoomTrackingOverride, setZoomTrackingOverride] = useState<boolean | null>(null);
  const showZoomTrackingUi = zoomTrackingDefaultEnabled && !!netConfig;
  const isZoomTrackingEnabled = useMemo(
    () => (showZoomTrackingUi ? (zoomTrackingOverride ?? zoomTrackingDefaultEnabled) : false),
    [showZoomTrackingUi, zoomTrackingDefaultEnabled, zoomTrackingOverride]
  );
  const viewerTarget = useMemo(() => {
    if (!canvas) {
      return undefined;
    }

    const canvasTargetId =
      typeof canvas.source_id === 'string' && canvas.source_id ? canvas.source_id : `http://canvas/${canvasId}`;

    return [
      { type: 'Canvas', id: canvasTargetId },
      { type: 'Manifest', id: 'http://manifest/top' },
    ];
  }, [canvas, canvasId]);

  const getContainerSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return null;
    }

    const bounds = container.getBoundingClientRect();
    const width = Math.round(bounds.width);
    const height = Math.round(bounds.height);
    if (width <= 0 || height <= 0) {
      return null;
    }

    return { width, height };
  }, []);

  const resizeRuntimeToSize = useCallback((nextSize: { width: number; height: number }) => {
    resizeAtlasRuntime(runtimeRef.current, nextSize);
  }, []);

  const handleViewerCreated = useCallback(
    (preset: { runtime?: RuntimeWithViewport | null }) => {
      runtimeRef.current = preset.runtime ?? null;
      setRuntimeTick(tick => tick + 1);

      const size = getContainerSize();
      if (size) {
        resizeRuntimeToSize(size);
      }

      setTabularHeadingsHomePosition(runtimeRef.current, netConfig);
    },
    [getContainerSize, netConfig, resizeRuntimeToSize]
  );

  useEffect(() => {
    runtimeRef.current = null;
  }, [canvasId]);

  useEffect(() => {
    setTabularHeadingsHomePosition(runtimeRef.current, netConfig);
  }, [netConfig]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const applyContainerSize = () => {
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
        applyContainerSize();
        frameHandle = null;
      });
    });

    observer.observe(container);
    applyContainerSize();

    return () => {
      observer.disconnect();
      if (frameHandle != null) {
        window.cancelAnimationFrame(frameHandle);
      }
    };
  }, [getContainerSize, resizeRuntimeToSize]);

  function goHome() {
    if (!goHomeToTabularHeadings(runtimeRef.current, netConfig)) {
      runtimeRef.current?.world?.goHome?.();
    }
  }

  function zoomOut() {
    runtimeRef.current?.world?.zoomOut?.();
  }

  function zoomIn() {
    runtimeRef.current?.world?.zoomIn?.();
  }

  return (
    <div className="h-full min-h-0 min-w-0 border-b border-gray-300 bg-gray-100 p-2">
      <div
        ref={containerRef}
        className="relative h-full min-h-0 min-w-0 overflow-hidden rounded border border-gray-400 bg-white"
      >
        <TabularCanvasViewportControls
          onHome={goHome}
          onZoomOut={zoomOut}
          onZoomIn={zoomIn}
          homeDisabled={!runtimeRef.current}
          zoomOutDisabled={!runtimeRef.current}
          zoomInDisabled={!runtimeRef.current}
          style={{ top: 12, right: 12, zIndex: 50 }}
          leadingControls={
            showZoomTrackingUi ? (
              <CanvasViewerButton
                type="button"
                onClick={() => setZoomTrackingOverride(!isZoomTrackingEnabled)}
                disabled={!netConfig}
                data-active={isZoomTrackingEnabled}
                aria-label="Toggle zoom tracking"
                aria-pressed={isZoomTrackingEnabled}
                title={isZoomTrackingEnabled ? 'Disable zoom tracking' : 'Enable zoom tracking'}
              >
                <PanIcon />
              </CanvasViewerButton>
            ) : null
          }
        />
        {showZoomTrackingUi && showVerticalNudgeControls && (onNudgeUp || onNudgeDown) ? (
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <CanvasViewerButton
              type="button"
              onClick={onNudgeUp}
              disabled={nudgeDisabled || !onNudgeUp}
              title="Nudge zoom tracking up"
            >
              <ArrowDownIcon style={{ transform: 'rotate(180deg)', fill: 'currentColor' }} />
            </CanvasViewerButton>
            <CanvasViewerButton
              type="button"
              onClick={onNudgeDown}
              disabled={nudgeDisabled || !onNudgeDown}
              title="Nudge zoom tracking down"
            >
              <ArrowDownIcon style={{ fill: 'currentColor' }} />
            </CanvasViewerButton>
          </div>
        ) : null}
        <EditorContentViewer
          height="100%"
          canvasId={canvasId}
          canvas={canvas}
          target={viewerTarget as any}
          homeCover="start"
          onCreated={handleViewerCreated as any}
        >
          {netConfig && showZoomTrackingUi ? (
            <>
              <FollowActiveCellOnCanvas
                runtimeRef={runtimeRef}
                runtimeTick={runtimeTick}
                value={netConfig}
                activeCell={activeCell}
                enabled={isZoomTrackingEnabled && !!activeCell}
              />
              <CastANetOverlayAtlas
                value={netConfig}
                onChange={() => undefined}
                disabled
                activeCell={activeCell}
                dimOpacity={0}
                previewOverlayOnly
              />
            </>
          ) : null}
        </EditorContentViewer>
      </div>
    </div>
  );
}
