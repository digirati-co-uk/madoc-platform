import React, { useCallback, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { useApi } from '../../shared/hooks/use-api';
import { useData, usePrefetchData } from '../../shared/hooks/use-data';
import { ViewManifestMirador } from '../components';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { CanvasLoader } from '../pages/loaders/canvas-loader';

export const CanvasMiradorViewer: React.FC = () => {
  const { data: canvasResponse } = useData(CanvasLoader);
  const prefetch = usePrefetchData(CanvasLoader);

  // const {} = use
  const canvas = canvasResponse?.canvas;
  const lastCanvasUrl = useRef<string>();
  const canvasUrl = canvas?.source_id;
  const { push } = useHistory();
  const createLink = useRelativeLinks();
  const api = useApi();
  const onChangeCanvas = useCallback((manifestUrl: string, newCanvasUrl: string) => {
    api.getCanvasSource(newCanvasUrl).then(async resp => {
      await prefetch([resp.id]);
      push(createLink({ canvasId: resp.id }));
    });
  }, []);

  useEffect(() => {
    lastCanvasUrl.current = canvasUrl;
  }, [canvasUrl]);

  if (!canvasUrl && !lastCanvasUrl.current) {
    return null;
  }

  return <ViewManifestMirador hideBreadcrumbs canvasUrl={canvasUrl} onChangeCanvas={onChangeCanvas} />;
};

blockEditorFor(CanvasMiradorViewer, {
  type: 'CanvasMiradorViewer',
  label: 'Mirador (single canvas)',
  requiredContext: ['manifest', 'canvas'],
  anyContext: ['canvas'],
  editor: {},
});
