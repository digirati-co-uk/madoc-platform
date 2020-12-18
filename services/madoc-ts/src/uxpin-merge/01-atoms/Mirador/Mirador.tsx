import React from 'react';
import OriginalMirador from '../../../frontend/shared/viewers/mirador';
import { ErrorBoundary } from 'react-error-boundary';

export type Props = {
  manifest: string;

  /**
   * @uxpinpropname main colour
   */
  main: string;

  /**
   * @uxpinpropname viewer height
   */
  height: number;
};

/**
 * @uxpincomponent
 */
function Mirador(props: Props) {
  return (
    <ErrorBoundary
      fallback={
        <div style={{ padding: 20, height: props.height || 500, minWidth: 500, background: '#444' }}>
          Mirador cannot be viewed currently
        </div>
      }
    >
      <div style={{ height: props.height || 500, minWidth: 500 }}>
        <OriginalMirador
          config={{
            id: 'demo',
            windows: [
              {
                imageToolsEnabled: true,
                allowClose: false,
                allowMaximize: false,
                sideBarOpenByDefault: true,
                manifestId: props.manifest,
              },
            ],
            workspaceControlPanel: {
              enabled: false,
            },
            theme: {
              palette: {
                primary: {
                  main: props.main || '#333',
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
      </div>
    </ErrorBoundary>
  );
}

export default Mirador;
