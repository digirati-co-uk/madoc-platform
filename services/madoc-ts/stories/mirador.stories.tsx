import { Mirador } from '../src/frontend/shared/viewers/mirador.lazy';
import * as React from 'react';

export default { title: 'Mirador viewer' };

export const defaultView = () => {
  return (
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
              manifestId: `https://view.nls.uk/manifest/7446/74464117/manifest.json`,
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
  );
};
