import React, { useEffect, useMemo, useRef } from 'react';
import { BaseEvents } from 'universalviewer';
import { useEvent, useUniversalViewer } from '../../../utility/use-universal-viewer';

export type UniversalViewerProps = {
  config?: any;
  manifestId: string;
  canvasIndex?: number;
  onChangeCanvas?: (manifest: string, canvas: string) => void;
  onChangeManifest?: (manifest: string) => void;
};

const UniversalViewer: React.FC<UniversalViewerProps> = React.memo(({ manifestId, canvasIndex, onChangeCanvas }) => {
  const ref = useRef<HTMLDivElement>(null);
  const lastIndex = useRef<number>();
  const options = useMemo(
    () => ({
      manifest: manifestId,
      canvasIndex: canvasIndex || 0,
    }),
    []
  );
  const uv = useUniversalViewer(ref, options);

  useEffect(() => {
    if (uv && (canvasIndex || canvasIndex === 0)) {
      if (lastIndex.current !== canvasIndex) {
        uv.publish(BaseEvents.CANVAS_INDEX_CHANGE, canvasIndex);
        lastIndex.current = canvasIndex;
      }
    }
  }, [canvasIndex, uv]);

  useEvent(uv, BaseEvents.CANVAS_INDEX_CHANGE, i => {
    if (onChangeCanvas) {
      if (lastIndex.current !== i) {
        const canvas = uv?.extension?.helper.getCanvasByIndex(i);
        if (canvas) {
          lastIndex.current = i;
          onChangeCanvas(manifestId, canvas.id);
        }
      }
    }
  });

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/universalviewer@4.0.0-pre.65/dist/esm/index.css" />
      <div className="uv" ref={ref} />
    </>
  );
});

UniversalViewer.displayName = 'UniversalViewer';

export default UniversalViewer;
