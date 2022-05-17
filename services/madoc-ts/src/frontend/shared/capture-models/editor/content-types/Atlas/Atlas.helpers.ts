import { ImageService } from '@iiif/presentation-3';
import { useCallback } from 'react';
import { createContext } from '../../../helpers/create-context';

export const [useImageServiceContext, ImageServiceContext] = createContext<ImageService>();

export function useCroppedRegion() {
  const imageService = useImageServiceContext();

  return useCallback(
    (props?: { x: number; y: number; width: number; height: number } | null) => {
      if (!imageService.tiles || !props) {
        return undefined;
      }

      // For this small preview, use the first tile.
      const tile = imageService.tiles[0];

      if (!tile) {
        return undefined;
      }

      return `${imageService.id}/${Math.floor(props.x)},${Math.floor(props.y)},${Math.floor(props.width)},${Math.floor(
        props.height
      )}/${tile.width},/0/default.jpg`;
    },
    [imageService.id, imageService.tiles]
  );
}
