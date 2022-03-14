import React, { useState } from 'react';
import { ViewerProvider } from '../../content-types/CanvasPanel/CanvasPanel';
import BoxSelectorCanvasPanel from './BoxSelector.canvas-panel';
import {
  CanvasProvider,
  CanvasRepresentation,
  Manifest,
  OpenSeadragonViewer,
  OpenSeadragonViewport,
  SingleTileSource,
  Viewport,
} from 'canvas-panel-beta';

export default { title: 'Selectors/Box Selector' };

export const CanvasPanelExample: React.FC = () => {
  const [selector, setSelector] = useState({ height: 388, width: 800, x: 843, y: 1173 });
  const [viewer, setViewer] = useState();
  return (
    <div style={{ background: 'grey', position: 'relative', userSelect: 'none' }}>
      <ViewerProvider value={viewer}>
        <Manifest url="https://wellcomelibrary.org/iiif/b18035723/manifest">
          <CanvasProvider>
            <SingleTileSource>
              <Viewport maxHeight={600} setRef={setViewer}>
                <OpenSeadragonViewport viewportController={true}>
                  <OpenSeadragonViewer maxHeight={1000} />
                </OpenSeadragonViewport>
                <CanvasRepresentation ratio={1}>
                  <BoxSelectorCanvasPanel
                    id="abc-123"
                    type="box-selector"
                    state={selector}
                    updateSelector={(s: any) => {
                      console.log(s);
                      setSelector(s);
                    }}
                  />
                </CanvasRepresentation>
              </Viewport>
            </SingleTileSource>
          </CanvasProvider>
        </Manifest>
      </ViewerProvider>
    </div>
  );
};
