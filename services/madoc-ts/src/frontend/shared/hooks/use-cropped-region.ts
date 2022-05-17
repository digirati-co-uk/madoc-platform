import { useImageService } from 'react-iiif-vault';
import { useCallback } from 'react';

export function useCroppedRegion() {
  const { data: imageService } = useImageService();

  return useCallback(
    (props?: { x: number; y: number; width: number; height: number } | null) => {
      if (!imageService || !imageService.tiles || !props) {
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
    [imageService]
  );
}
