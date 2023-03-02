import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useApi } from '../../shared/hooks/use-api';
import React, { useMemo } from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { BrowserComponent } from '../../shared/utility/browser-component';
import { useRouteContext } from '../hooks/use-route-context';
import { UniversalViewer } from '../../shared/viewers/universal-viewer.lazy';

export const ViewManifestUV: React.FC<{
  canvasIndex?: number;
  hideBreadcrumbs?: boolean;
  onChangeCanvas?: (manifest: string, canvas: string) => void;
  onChangeManifest?: (manifest: string) => void;
}> = ({ canvasIndex, hideBreadcrumbs, onChangeCanvas, onChangeManifest }) => {
  const { manifestId } = useRouteContext();

  const api = useApi();
  const slug = api.getSiteSlug();

  // some config?
  const config = useMemo(() => {
    return {};
  }, []);

  if (api.getIsServer() || !manifestId) {
    return null;
  }

  return (
    <div>
      {hideBreadcrumbs ? null : <DisplayBreadcrumbs />}
      <div style={{ position: 'relative', height: '80vh' }}>
        <BrowserComponent fallback={<div>loading...</div>}>
          <UniversalViewer
            manifestId={`/s/${slug}/madoc/api/manifests/${manifestId}/export/source`}
            canvasIndex={canvasIndex}
            onChangeCanvas={onChangeCanvas}
            onChangeManifest={onChangeManifest}
            config={config}
          />
        </BrowserComponent>
      </div>
    </div>
  );
};

blockEditorFor(ViewManifestUV, {
  type: 'ViewManifestUV',
  label: 'Universal Viewer',
  requiredContext: ['manifest'],
  editor: {},
});
