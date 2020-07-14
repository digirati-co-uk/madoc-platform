import React, { useLayoutEffect, useState } from 'react';
import { ImageService } from '@hyperion-framework/types';
import { AtlasAuto } from '@atlas-viewer/atlas';
import { useCanvas, useImageService } from '@hyperion-framework/react-vault';
import { AtlasTiledImages } from './AtlasTiledImages';

export const SimpleAtlasViewer: React.FC<{ style?: React.CSSProperties }> = ({ style = { height: 600 } }) => {
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
          </world>
        </AtlasAuto>
      ) : null}
    </div>
  );
};
