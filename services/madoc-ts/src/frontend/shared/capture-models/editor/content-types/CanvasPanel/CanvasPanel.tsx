import {
  CanvasProvider,
  CanvasRepresentation,
  Manifest,
  OpenSeadragonViewer,
  OpenSeadragonViewport,
  SingleTileSource,
  Viewport,
} from 'canvas-panel-beta';
import React, { Suspense, useState } from 'react';
import { createContext } from '../../../helpers/create-context';
import { BaseContent } from '../../../types/content-types';
import { useAllSelectors, useCurrentSelector } from '../../stores/selectors/selector-hooks';

export interface CanvasPanelProps extends BaseContent {
  id: string;
  type: string;
  state: {
    maxHeight?: number;
    canvasId: string;
    manifestId: string;
  };
}

export const [useViewer, ViewerProvider] = createContext<any>();

export const CanvasPanel: React.FC<CanvasPanelProps['state']> = ({ canvasId, manifestId, maxHeight }) => {
  const [viewer, setViewer] = useState<any>();
  // Starting with display selectors. I need the selector context, BUT it should
  // work without the context too.
  const currentSelector = useCurrentSelector('canvas-panel', {
    width: 400,
    height: 400,
    x: 500,
    y: 500,
  });

  const allSelectors = useAllSelectors('canvas-panel', {
    topLevelSelectors: true,
    displaySelectors: true,
    currentSelector: true,
    adjacentSelectors: false,
  });

  return (
    <Suspense fallback={() => null}>
      <ViewerProvider value={viewer}>
        <Manifest url={manifestId}>
          <CanvasProvider startCanvas={canvasId || undefined}>
            <SingleTileSource>
              <Viewport maxHeight={maxHeight || window.innerHeight} setRef={setViewer}>
                <OpenSeadragonViewport viewportController={true}>
                  <OpenSeadragonViewer maxHeight={1000} />
                </OpenSeadragonViewport>
                <CanvasRepresentation ratio={1}>{allSelectors}</CanvasRepresentation>
                <CanvasRepresentation ratio={1}>{currentSelector}</CanvasRepresentation>
              </Viewport>
            </SingleTileSource>
          </CanvasProvider>
        </Manifest>
      </ViewerProvider>
    </Suspense>
  );
};

const WrappedCanvasPanel: React.FC<CanvasPanelProps> = ({ id, state }) => {
  return <CanvasPanel key={id} {...state} />;
};

export default WrappedCanvasPanel;
