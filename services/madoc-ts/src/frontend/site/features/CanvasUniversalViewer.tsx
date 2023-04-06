import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useApi } from '../../shared/hooks/use-api';
import { useData, usePrefetchData } from '../../shared/hooks/use-data';
import { useManifestStructure } from '../../shared/hooks/use-manifest-structure';
import { useSlots } from '../../shared/page-blocks/slot-context';
import { ViewManifestUV } from '../components';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { CanvasLoader } from '../pages/loaders/canvas-loader';

export const CanvasUniversalViewer: React.FC = () => {
  const { data: canvasResponse } = useData(CanvasLoader);
  const prefetch = usePrefetchData(CanvasLoader);
  const { context } = useSlots();
  const { data } = useManifestStructure(context.manifest);
  const canvasIndex = data?.ids.indexOf(canvasResponse?.canvas?.id as any);
  const canvas = canvasResponse?.canvas;
  const lastCanvasUrl = useRef<string>();
  const canvasUrl = canvas?.source_id;
  const navigate = useNavigate();
  const createLink = useRelativeLinks();
  const api = useApi();
  const onChangeCanvas = useCallback(
    (manifestUrl: string, newCanvasUrl: string) => {
      api.getCanvasSource(newCanvasUrl).then(async resp => {
        await prefetch([resp.id], { ...context, canvas: resp.id });
        navigate(createLink({ canvasId: resp.id }));
      });
    },
    [api, context, createLink, prefetch, navigate]
  );

  useEffect(() => {
    lastCanvasUrl.current = canvasUrl;
  }, [canvasUrl]);

  if (!canvasUrl && !lastCanvasUrl.current) {
    return null;
  }

  return (
    <ViewManifestUV
      hideBreadcrumbs
      canvasIndex={canvasIndex && canvasIndex >= 0 ? canvasIndex : undefined}
      onChangeCanvas={onChangeCanvas}
    />
  );
};

blockEditorFor(CanvasUniversalViewer, {
    type: 'CanvasUniversalViewer',
    label: 'UniversalViewer (single canvas)',
    requiredContext: ['manifest', 'canvas'],
    anyContext: ['canvas'],
    editor: {},
});
