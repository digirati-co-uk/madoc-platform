import React, { useLayoutEffect, useState } from 'react';
import { ImageService } from '@hyperion-framework/types';
import { AtlasAuto, HTMLPortal, RegionHighlight } from '@atlas-viewer/atlas';
import { useCanvas, useImageService } from '@hyperion-framework/react-vault';
import { AtlasTiledImages } from './AtlasTiledImages';

export const SimpleAtlasViewer: React.FC<{
  style?: React.CSSProperties;
  highlightedRegions?: Array<[number, number, number, number]>;
}> = ({ style = { height: 600 }, highlightedRegions }) => {
  const canvas = useCanvas();
  const { data: service } = useImageService();
  const [isLoaded, setIsLoaded] = useState(false);

  useLayoutEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!canvas) {
    return null;
  }

  return (
    <div>
      {isLoaded ? (
        <AtlasAuto style={style}>
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
                            console.log('clicked?');
                          }}
                        />
                      </React.Fragment>
                    );
                  })
                : null}
            </worldObject>
          </world>
        </AtlasAuto>
      ) : null}
    </div>
  );
};
