import { Tooltip as ReactTooltip } from 'react-tooltip';
import { getTabularCellBounds } from '@/frontend/admin/components/tabular/cast-a-net/tabular-cell-bounds';
import { TabularNetAlignmentToolbar } from './tabular-net-alignment-toolbar';
import { TabularNetAlignmentControls } from './tabular-net-alignment-controls';
import { TabularNetAlignmentGuides } from './tabular-net-alignment-guides';
import {
  ALIGNMENT_STEP,
  nudgeHorizontalAlignment,
  type TabularHorizontalAlignment,
} from '@/frontend/shared/utility/tabular-horizontal-alignment';
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
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
  onHorizontalAlignmentChange?: (value: TabularHorizontalAlignment) => void;
  initialNetConfig?: NetConfig | null;
};

export function TabularProjectCustomEditorCanvas({
  canvasId,
  canvas,
  netConfig: sourceNetConfig,
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
  onHorizontalAlignmentChange,
  initialNetConfig,
}: TabularProjectCustomEditorCanvasProps) {
  const tooltipId = useId();
  const [alignmentExpanded, setAlignmentExpanded] = useState(false);
  const [alignmentPreview, setAlignmentPreview] = useState<TabularHorizontalAlignment | null>(null);
  const isAligning = !!alignmentPreview;
  const alignmentConfigRef = useRef(sourceNetConfig);
  alignmentConfigRef.current = sourceNetConfig;
  const netConfig = useMemo(
    () => (sourceNetConfig ? { ...sourceNetConfig, ...alignmentPreview } : null),
    [sourceNetConfig, alignmentPreview]
  );
  const alignButtonRef = useRef<HTMLButtonElement>(null);
  const finishAlignment = useCallback<() => void>(() => {
    setAlignmentPreview(null);
    requestAnimationFrame(() => alignButtonRef.current?.focus());
  }, []);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<RuntimeWithViewport | null>(null);
  const [runtimeTick, setRuntimeTick] = useState(0);
  const [zoomTrackingOverride, setZoomTrackingOverride] = useState<boolean | null>(null);
  const hideNudgeControlsResolved = hideZoomTrackingNudgeControls || hideNudgeControls;
  const showZoomTrackingUi = zoomTrackingDefaultEnabled && !!netConfig;
  const showZoomTrackingToggle = showZoomTrackingUi && !hideZoomTrackingToggle;
  const isViewerReady = !!runtimeRef.current;
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

      setTabularHeadingsHomePosition(runtimeRef.current, alignmentConfigRef.current);
    },
    [getContainerSize, resizeRuntimeToSize]
  );

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

  const runViewerCommand = useCallback((atlasCommand: (runtime: RuntimeWithViewport | null) => void) => {
    atlasCommand(runtimeRef.current);
  }, []);

  const goHome = useCallback(() => {
    runViewerCommand(runtime => {
      if (!goHomeToTabularHeadings(runtime, netConfig)) {
        runtime?.world?.goHome?.();
      }
    });
  }, [netConfig, runViewerCommand]);

  const zoomOut = useCallback(() => {
    runViewerCommand(runtime => runtime?.world?.zoomOut?.());
  }, [runViewerCommand]);

  const zoomIn = useCallback(() => {
    runViewerCommand(runtime => {
      // Review loads its canvas inside the viewer, so it may not have a canvas prop.
      const width = canvas?.width ?? runtime?.world?.width;
      const height = canvas?.height ?? runtime?.world?.height;
      const cell =
        !isAligning && activeCell && netConfig && width && height
          ? getTabularCellBounds(netConfig, activeCell, { width, height })
          : null;
      runtime?.world?.zoomIn?.(cell ? { x: cell.x + cell.width / 2, y: cell.y + cell.height / 2 } : undefined);
    });
  }, [runViewerCommand, isAligning, activeCell, netConfig, canvas]);

  function rotate() {
    runViewerCommand(runtime => runtime?.world?.rotateBy?.(90));
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-2 border-b border-gray-300 bg-gray-100 p-2">
      <div
        ref={containerRef}
        className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded border border-gray-400 bg-white"
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
                <CanvasViewerButton type="button" onClick={rotate} disabled={!!alignmentPreview} title="Rotate image">
                  <RotateIcon title="Rotate image" />
                </CanvasViewerButton>
              ) : null}
              {showZoomTrackingToggle ? (
                <CanvasViewerButton
                  type="button"
                  onClick={() => setZoomTrackingOverride(!isZoomTrackingEnabled)}
                  disabled={!netConfig || !!alignmentPreview}
                  data-active={isZoomTrackingEnabled}
                  aria-label="Toggle table row tracking"
                  aria-pressed={isZoomTrackingEnabled}
                  title={isZoomTrackingEnabled ? 'Disable table row tracking' : 'Enable table row tracking'}
                >
                  <PanIcon />
                </CanvasViewerButton>
              ) : null}
            </>
          }
        />
        {shouldShowNudgeControls && netConfig ? (
          <TabularNetAlignmentToolbar
            expanded={alignmentExpanded}
            previewing={isAligning}
            disabled={nudgeDisabled || !isViewerReady}
            tooltipId={tooltipId}
            toggleRef={alignButtonRef}
            onToggle={() => {
              if (alignmentExpanded) finishAlignment();
              setAlignmentExpanded(!alignmentExpanded);
            }}
            onUp={onNudgeUp}
            onDown={onNudgeDown}
            onLeft={
              onHorizontalAlignmentChange && netConfig.left > 0
                ? () => onHorizontalAlignmentChange(nudgeHorizontalAlignment(netConfig, -ALIGNMENT_STEP))
                : undefined
            }
            onRight={
              onHorizontalAlignmentChange && netConfig.left + netConfig.width < 100
                ? () => onHorizontalAlignmentChange(nudgeHorizontalAlignment(netConfig, ALIGNMENT_STEP))
                : undefined
            }
            onAlign={
              onHorizontalAlignmentChange
                ? () => setAlignmentPreview({ left: netConfig.left, width: netConfig.width })
                : undefined
            }
          />
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
                enabled={isZoomTrackingEnabled && !!activeCell && !alignmentPreview}
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
              {alignmentPreview ? <TabularNetAlignmentGuides value={netConfig} onChange={setAlignmentPreview} /> : null}
            </>
          ) : null}
        </EditorContentViewer>
      </div>
      {alignmentPreview && sourceNetConfig ? (
        <TabularNetAlignmentControls
          value={alignmentPreview}
          tooltipId={tooltipId}
          onChange={setAlignmentPreview}
          disabled={nudgeDisabled}
          onApply={() => {
            onHorizontalAlignmentChange?.(alignmentPreview);
            finishAlignment();
          }}
          onCancel={finishAlignment}
          onReset={() =>
            setAlignmentPreview({
              left: (initialNetConfig || sourceNetConfig).left,
              width: (initialNetConfig || sourceNetConfig).width,
            })
          }
        />
      ) : null}
      <ReactTooltip
        id={tooltipId}
        place="bottom"
        variant="dark"
        delayShow={0}
        positionStrategy="fixed"
        style={{ zIndex: 100 }}
      />
    </div>
  );
}
