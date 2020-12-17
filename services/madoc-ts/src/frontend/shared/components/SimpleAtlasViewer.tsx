import React, { useLayoutEffect, useRef, useState } from 'react';
import { ImageService } from '@hyperion-framework/types';
import { AtlasAuto, RegionHighlight, Runtime } from '@atlas-viewer/atlas';
import { useCanvas, useImageService } from '@hyperion-framework/react-vault';
import { Button, ButtonRow } from '../atoms/Button';
import { AtlasTiledImages } from './AtlasTiledImages';

export const SimpleAtlasViewer: React.FC<{
  style?: React.CSSProperties;
  highlightedRegions?: Array<[number, number, number, number]>;
}> = ({ style = { height: 600 }, highlightedRegions }) => {
  const canvas = useCanvas();
  const runtime = useRef<Runtime>();
  const { data: service } = useImageService();
  const [isLoaded, setIsLoaded] = useState(false);

  const goHome = () => {
    if (runtime.current) {
      runtime.current.world.goHome();
    }
  };

  const zoomIn = () => {
    if (runtime.current) {
      runtime.current.world.zoomIn();
    }
  };

  const zoomOut = () => {
    if (runtime.current) {
      runtime.current.world.zoomOut();
    }
  };

  useLayoutEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!canvas) {
    return null;
  }

  return (
    <div style={{ position: 'relative' }}>
      {isLoaded ? (
        <>
          <AtlasAuto style={style} onCreated={rt => (runtime.current = rt.runtime)}>
            <world>
              <AtlasTiledImages canvas={canvas} service={service as ImageService} />
              <worldObject height={canvas.height} width={canvas.width}>
                {highlightedRegions
                  ? highlightedRegions.map(([x, y, width, height], key) => {
                      return (
                        <React.Fragment key={key}>
                          <RegionHighlight
                            region={{ id: key, x, y, width, height }}
                            isEditing={false}
                            background={'rgba(2,219,255, .5)'}
                            onSave={() => {
                              // no-op
                            }}
                            onClick={() => {
                              // no-op
                            }}
                          />
                        </React.Fragment>
                      );
                    })
                  : null}
              </worldObject>
            </world>
          </AtlasAuto>
          <ButtonRow style={{ position: 'absolute', top: 0, left: 10, zIndex: 20 }}>
            <Button onClick={goHome}>Home</Button>
            <Button onClick={zoomOut}>-</Button>
            <Button onClick={zoomIn}>+</Button>
          </ButtonRow>
        </>
      ) : null}
    </div>
  );
};
