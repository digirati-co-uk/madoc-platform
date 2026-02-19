import React, { useMemo, useRef, useState } from 'react';
import { CastANetOverlayAtlas } from '../../../frontend/admin/components/tabular/cast-a-net/CastANetOverlayAtlas';
import {
  FollowActiveCellOnCanvas,
  type RuntimeWithViewport,
} from '../../../frontend/admin/components/tabular/cast-a-net/FollowActiveCellOnCanvas';
import type { NetConfig, TabularCellRef } from '../../../frontend/admin/components/tabular/cast-a-net/types';
import { CanvasViewerButton } from '../../../frontend/shared/atoms/CanvasViewerGrid';
import { EditorContentViewer } from '../../../frontend/shared/capture-models/new/EditorContent';
import { HomeIcon } from '../../../frontend/shared/icons/HomeIcon';
import { MinusIcon } from '../../../frontend/shared/icons/MinusIcon';
import { PlusIcon } from '../../../frontend/shared/icons/PlusIcon';
import type { CanvasFull } from '../../../types/canvas-full';

type TabularProjectCustomEditorCanvasProps = {
  canvasId: number;
  canvas?: CanvasFull['canvas'];
  netConfig: NetConfig | null;
  activeCell: TabularCellRef | null;
  zoomTrackingDefaultEnabled: boolean;
};

export function TabularProjectCustomEditorCanvas({
  canvasId,
  canvas,
  netConfig,
  activeCell,
  zoomTrackingDefaultEnabled,
}: TabularProjectCustomEditorCanvasProps) {
  const runtimeRef = useRef<RuntimeWithViewport | null>(null);
  const [runtimeTick, setRuntimeTick] = useState(0);
  const [zoomTrackingOverride, setZoomTrackingOverride] = useState<boolean | null>(null);
  const isZoomTrackingEnabled = useMemo(
    () => zoomTrackingOverride ?? zoomTrackingDefaultEnabled,
    [zoomTrackingDefaultEnabled, zoomTrackingOverride]
  );

  function goHome() {
    runtimeRef.current?.world?.goHome?.();
  }

  function zoomOut() {
    runtimeRef.current?.world?.zoomOut?.();
  }

  function zoomIn() {
    runtimeRef.current?.world?.zoomIn?.();
  }

  return (
    <div className="min-h-0 border-b border-gray-300 bg-gray-100 p-2">
      <div className="relative h-full min-h-0 overflow-hidden rounded border border-gray-400 bg-white">
        <EditorContentViewer
          height="100%"
          canvasId={canvasId}
          canvas={canvas}
          onCreated={preset => {
            runtimeRef.current = (preset.runtime as RuntimeWithViewport | null) ?? null;
            setRuntimeTick(tick => tick + 1);
          }}
        >
          {netConfig ? (
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

        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 220,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <button
            type="button"
            aria-label="Toggle zoom tracking"
            aria-pressed={isZoomTrackingEnabled}
            onClick={() => setZoomTrackingOverride(!isZoomTrackingEnabled)}
            disabled={!netConfig}
            title={isZoomTrackingEnabled ? 'Zoom tracking on' : 'Zoom tracking off'}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              height: 24,
              width: 44,
              borderRadius: 9999,
              border: 'none',
              padding: 0,
              cursor: !netConfig ? 'not-allowed' : 'pointer',
              opacity: !netConfig ? 0.6 : 1,
              background: isZoomTrackingEnabled ? '#4265e9' : '#c9ced8',
              boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                height: 20,
                width: 20,
                borderRadius: '100%',
                background: '#fff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                transform: `translateX(${isZoomTrackingEnabled ? 22 : 2}px)`,
                transition: 'transform 0.15s ease',
              }}
            />
          </button>
          <CanvasViewerButton
            onClick={goHome}
            disabled={!runtimeRef.current}
            style={{
              border: '1px solid #c8cfdb',
              borderRadius: 6,
              boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
            }}
          >
            <HomeIcon title="Home" />
          </CanvasViewerButton>
          <CanvasViewerButton
            onClick={zoomOut}
            disabled={!runtimeRef.current}
            style={{
              border: '1px solid #c8cfdb',
              borderRadius: 6,
              boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
            }}
          >
            <MinusIcon title="Zoom out" />
          </CanvasViewerButton>
          <CanvasViewerButton
            onClick={zoomIn}
            disabled={!runtimeRef.current}
            style={{
              border: '1px solid #c8cfdb',
              borderRadius: 6,
              boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
            }}
          >
            <PlusIcon title="Zoom in" />
          </CanvasViewerButton>
        </div>
      </div>
    </div>
  );
}
