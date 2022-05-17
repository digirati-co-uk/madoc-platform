import React, { useEffect, useState } from 'react';
import { CanvasNormalized, ImageService } from '@iiif/presentation-3';
import { GetTile, getTileFromImageService, TileSet, useRuntime } from '@atlas-viewer/atlas';

export const AtlasTiledImages: React.FC<{ canvas: CanvasNormalized; service: ImageService }> = ({
  canvas,
  service,
}) => {
  const [tile, setTile] = useState<GetTile>();
  const runtime = useRuntime();

  useEffect(() => {
    if (service && runtime) {
      getTileFromImageService((service as any).id, canvas.width, canvas.height).then(s => {
        setTile(s); // only show the first image.
        // @todo change this to be when the new image is REPLACED in the frame. Maybe better done at Atlas level.
        runtime.goHome();
      });
    }
  }, [runtime, service, canvas]);

  if (!tile) {
    return (
      <worldObject height={canvas.height} width={canvas.width}>
        <box html target={{ x: 0, y: 0, width: canvas.width, height: canvas.height }} id="123" backgroundColor="#000" />
      </worldObject>
    );
  }

  return <TileSet tiles={tile} x={0} y={0} width={canvas.width} height={canvas.height} />;
};
