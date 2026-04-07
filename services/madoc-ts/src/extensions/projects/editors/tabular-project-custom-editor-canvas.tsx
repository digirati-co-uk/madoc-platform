import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CastANetOverlayAtlas } from '@/frontend/admin/components/tabular/cast-a-net/CastANetOverlayAtlas';
import {
  FollowActiveCellOnCanvas,
  type RuntimeWithViewport,
} from '@/frontend/admin/components/tabular/cast-a-net/FollowActiveCellOnCanvas';
import { InfoMessage } from '@/frontend/shared/callouts/InfoMessage';
import type { NetConfig, TabularCellRef } from '@/frontend/shared/utility/tabular-types';
import {
  goHomeToTabularHeadings,
  setTabularHeadingsHomePosition,
} from '@/frontend/shared/utility/tabular-heading-home';
import { resizeAtlasRuntime } from '@/frontend/shared/utility/resize-atlas-runtime';
import { CanvasViewerButton } from '@/frontend/shared/atoms/CanvasViewerGrid';
import { EditorContentViewer } from '@/frontend/shared/capture-models/new/EditorContent';
import { OpenSeadragonViewer } from '@/frontend/shared/features/OpenSeadragonViewer.lazy';
import { ArrowDownIcon } from '@/frontend/shared/icons/ArrowDownIcon';
import { PanIcon } from '@/frontend/shared/icons/PanIcon';
import { RotateIcon } from '@/frontend/shared/icons/RotateIcon';
import { Button } from '@/frontend/shared/navigation/Button';
import { BrowserComponent } from '@/frontend/shared/utility/browser-component';
import { TabularCanvasViewportControls } from '@/frontend/shared/components/TabularCanvasViewportControls';
import type { TabularOverlayColors } from '@/frontend/shared/utility/tabular-project-config';
import type { CanvasFull } from '@/types/canvas-full';

type TabularProjectCustomEditorCanvasProps = {
  canvasId: number;
  canvas?: CanvasFull['canvas'];
  netConfig: NetConfig | null;
  activeCell: TabularCellRef | null;
  hideViewerControls?: boolean;
  enableRotation?: boolean;
  zoomTrackingDefaultEnabled: boolean;
  hideZoomTrackingToggle?: boolean;
  hideZoomTrackingNudgeControls?: boolean;
  hideNudgeControls?: boolean;
  overlayColors?: TabularOverlayColors;
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
  hideViewerControls = false,
  enableRotation = false,
  zoomTrackingDefaultEnabled,
  hideZoomTrackingToggle = false,
  hideZoomTrackingNudgeControls = false,
  hideNudgeControls = false,
  overlayColors,
  showVerticalNudgeControls = false,
  onNudgeUp,
  onNudgeDown,
  nudgeDisabled = false,
}: TabularProjectCustomEditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<RuntimeWithViewport | null>(null);
  const osdRef = useRef<any>(null);
  const pendingRotateRef = useRef(false);
  const [runtimeTick, setRuntimeTick] = useState(0);
  const [isOSD, setIsOSD] = useState(false);
  const [zoomTrackingOverride, setZoomTrackingOverride] = useState<boolean | null>(null);
  const hideNudgeControlsResolved = hideZoomTrackingNudgeControls || hideNudgeControls;
  const showZoomTrackingUi = zoomTrackingDefaultEnabled && !!netConfig && !isOSD;
  const showZoomTrackingToggle = showZoomTrackingUi && !hideZoomTrackingToggle;
  const isViewerReady = isOSD ? !!osdRef.current : !!runtimeRef.current;
  const shouldShowNudgeControls =
    showZoomTrackingUi && !hideNudgeControlsResolved && showVerticalNudgeControls && Boolean(onNudgeUp || onNudgeDown);
  const isZoomTrackingEnabled = useMemo(() => {
    if (!showZoomTrackingUi) {
      return false;
    }

    if (!showZoomTrackingToggle) {
      return true;
    }

    return zoomTrackingOverride ?? zoomTrackingDefaultEnabled;
  }, [showZoomTrackingToggle, showZoomTrackingUi, zoomTrackingDefaultEnabled, zoomTrackingOverride]);
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
    osdRef.current = null;
    pendingRotateRef.current = false;
    setIsOSD(false);
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

  const runViewerCommand = useCallback(
    (atlasCommand: (runtime: RuntimeWithViewport | null) => void, osdCommand: (viewer: any) => void) => {
      if (isOSD) {
        osdCommand(osdRef.current);
        return;
      }

      atlasCommand(runtimeRef.current);
    },
    [isOSD]
  );

  const goHome = useCallback(() => {
    runViewerCommand(
      runtime => {
        if (!goHomeToTabularHeadings(runtime, netConfig)) {
          runtime?.world?.goHome?.();
        }
      },
      viewer => viewer?.goHome?.()
    );
  }, [netConfig, runViewerCommand]);

  const zoomOut = useCallback(() => {
    runViewerCommand(
      runtime => runtime?.world?.zoomOut?.(),
      viewer => viewer?.zoomOut?.()
    );
  }, [runViewerCommand]);

  const zoomIn = useCallback(() => {
    runViewerCommand(
      runtime => runtime?.world?.zoomIn?.(),
      viewer => viewer?.zoomIn?.()
    );
  }, [runViewerCommand]);

  function rotate() {
    setIsOSD(true);

    if (osdRef.current) {
      osdRef.current.rotate?.();
      return;
    }

    pendingRotateRef.current = true;
  }

  const resetRotationMode = useCallback(() => {
    pendingRotateRef.current = false;
    setIsOSD(false);
  }, []);

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
          homeDisabled={!isViewerReady}
          zoomOutDisabled={!isViewerReady}
          zoomInDisabled={!isViewerReady}
          hideHomeAndZoomControls={hideViewerControls}
          style={{ top: 12, right: 12, zIndex: 50 }}
          leadingControls={
            <>
              {enableRotation ? (
                <CanvasViewerButton type="button" onClick={rotate} title="Rotate image">
                  <RotateIcon title="Rotate image" />
                </CanvasViewerButton>
              ) : null}
              {showZoomTrackingToggle ? (
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
              ) : null}
            </>
          }
        />
        {shouldShowNudgeControls ? (
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
        {isOSD ? (
          <>
            <InfoMessage style={{ lineHeight: '3.4em', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
              Zoom tracking is disabled while rotating.
              <Button style={{ margin: '0.8em' }} onClick={resetRotationMode}>
                Reset
              </Button>
            </InfoMessage>
            <BrowserComponent fallback={null}>
              <OpenSeadragonViewer
                ref={osdRef}
                onReady={() => {
                  if (pendingRotateRef.current) {
                    pendingRotateRef.current = false;
                    osdRef.current?.rotate?.();
                  }
                }}
              />
            </BrowserComponent>
          </>
        ) : (
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
                  overlayColors={overlayColors}
                  dimOpacity={0}
                  previewOverlayOnly
                />
              </>
            ) : null}
          </EditorContentViewer>
        )}
      </div>
    </div>
  );
}
