import {
  createImageServiceRequest,
  ImageServiceImageRequest,
  imageServiceRequestToString,
  RegionParameter,
} from '@atlas-viewer/iiif-image-api';
import { ImageService } from '@iiif/presentation-3';

export async function getCroppedImageFromService(
  imageService: ImageService,
  options: { validate?: boolean; region?: RegionParameter; width?: number; height?: number } = {}
) {
  const sizeWidth = options.width || 256;
  imageService.id = (imageService.id || imageService['@id']) as string;

  if (!imageService.id) {
    return null;
  }

  const request = createImageServiceRequest(imageService);

  const url = imageServiceRequestToString({
    ...request,
    type: 'image',
    region: options.region || { full: true },
    size: sizeWidth
      ? { width: Number(sizeWidth), max: false, confined: false, upscaled: false }
      : { max: true, confined: false, upscaled: false },
  } as ImageServiceImageRequest);

  if (options.validate === false) {
    return url;
  }

  if (url) {
    const image = await fetch(url, {
      method: 'HEAD',
    });
    if (image.ok) {
      return url;
    }
    return null;
  }
  return null;
}
