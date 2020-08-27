import { Mirador } from '../../shared/viewers/mirador.lazy';
import { useApi } from '../../shared/hooks/use-api';
import React from 'react';
import { ManifestFull } from '../../../types/schemas/manifest-full';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { ProjectFull } from '../../../types/schemas/project-full';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';

export const ViewManifestMirador: React.FC<{
  manifest: ManifestFull['manifest'];
  collection?: CollectionFull['collection'];
  project?: ProjectFull;
}> = ({ manifest }) => {
  const api = useApi();

  const slug = api.getSiteSlug();

  if (api.getIsServer()) {
    return null;
  }

  return (
    <div>
      <DisplayBreadcrumbs />
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
                  manifestId: `/s/${slug}/madoc/api/manifests/${manifest.id}/export/source`,
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
            }}
            viewerConfig={{}}
          />
        </React.Suspense>
      </div>
    </div>
  );
};
