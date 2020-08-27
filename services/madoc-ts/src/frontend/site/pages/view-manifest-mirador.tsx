import { Mirador } from '../../shared/viewers/mirador.lazy';
import { useApi } from '../../shared/hooks/use-api';
import React from 'react';

export const ViewManifestMirador: React.FC = () => {
  const api = useApi();

  if (api.getIsServer()) {
    return null;
  }

  return (
    <div style={{ position: 'relative', height: '80vh' }}>
      <React.Suspense fallback={<div>loading...</div>}>
        <Mirador
          config={{
            id: 'demo',
            windows: [
              {
                imageToolsEnabled: true,
                allowClose: false,
                allowMaximize: false,
                sideBarOpenByDefault: true,
                manifestId: '/s/default/madoc/api/manifests/2/export/source',
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
                }

              },
            },
          }}
          viewerConfig={{}}
        />
      </React.Suspense>
    </div>
  );
};
