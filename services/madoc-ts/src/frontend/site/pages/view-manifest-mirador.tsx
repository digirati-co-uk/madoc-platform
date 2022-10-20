import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { BrowserComponent } from '../../shared/utility/browser-component';
import { Mirador } from '../../shared/viewers/mirador.lazy';
import { useApi } from '../../shared/hooks/use-api';
import React, { useMemo } from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { useRouteContext } from '../hooks/use-route-context';

export const ViewManifestMirador: React.FC<{
  canvasUrl?: string;
  hideNavigation?: boolean;
  hideBreadcrumbs?: boolean;
  onChangeCanvas?: (manifest: string, canvas: string) => void;
  onChangeManifest?: (manifest: string) => void;
}> = ({ canvasUrl, hideNavigation, hideBreadcrumbs, onChangeCanvas, onChangeManifest }) => {
  const { manifestId } = useRouteContext();

  const api = useApi();
  const slug = api.getSiteSlug();

  const config = useMemo(() => {
    return {
      id: 'demo',
      windows: [
        {
          id: 'window-1',
          imageToolsEnabled: true,
          imageToolsOpen: false,
          allowClose: false,
          allowMaximize: false,
          sideBarOpenByDefault: true,
          manifestId: `/s/${slug}/madoc/api/manifests/${manifestId}/export/source`,
          canvasId: canvasUrl,
        },
      ],
      workspaceControlPanel: {
        enabled: false,
      },
      theme: {
        palette: {
          primary: {
            main: '#333',
          },
          shades: {
            dark: '#ffffff',
            main: '#ffffff',
            light: '#fffff',
          },
        },
      },
    };
  }, [manifestId, slug]);

  if (api.getIsServer() || !manifestId) {
    return null;
  }

  return (
    <div>
      {hideBreadcrumbs ? null : <DisplayBreadcrumbs />}
      <div style={{ position: 'relative', height: '80vh' }}>
        {hideNavigation ? <style>{`.mirador-osd-navigation { display: none }`}</style> : null}
        <BrowserComponent fallback={<div>loading...</div>}>
          <Mirador
            canvasId={canvasUrl}
            onChangeCanvas={onChangeCanvas}
            onChangeManifest={onChangeManifest}
            config={config}
            viewerConfig={{}}
          />
        </BrowserComponent>
      </div>
    </div>
  );
};

blockEditorFor(ViewManifestMirador, {
  type: 'ViewManifestMirador',
  label: 'Mirador manifest viewer',
  requiredContext: ['manifest'],
  editor: {},
});
