import * as path from 'path';
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { userWithScope } from '../../utility/user-with-scope';
import sharp from 'sharp';
import FormData from 'form-data';

export const generateThumbnails: RouteMiddleware<{ mediaId: string }, { sizes: number[] }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const mediaId = context.params.mediaId;
  const siteApi = api.asUser({ siteId });

  // 1. Make sure media exists in DB
  const media = await context.media.getMediaById(mediaId, siteId);

  if (!media) {
    throw new NotFound();
  }

  // 1.5 Check if sizes already exist.
  const requestedThumbs = context.requestBody.sizes || [];
  const existingSizes = Object.keys(media.thumbnails || {})
    .map(t => Number(t))
    .filter(t => !Number.isNaN(t));
  const thumbsToGenerate = requestedThumbs.filter(size => existingSizes.indexOf(size) === -1);

  if (thumbsToGenerate.length) {
    // 2. Fetch media source from storage API
    const mediaSource = await siteApi.getStorageRaw('media', `${media.id}/${media.fileName}`, true);

    const buffer = Buffer.from(await mediaSource.arrayBuffer());

    const newThumbnailMap = {
      ...(media.thumbnails || {}),
    };

    for (const size of thumbsToGenerate) {
      // 3. Generate thumbnails and upload to storage API
      const resizedImage = await sharp(buffer)
        .resize({
          height: size,
          width: size,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFormat('jpeg')
        .toBuffer();

      const fileName = path.parse(media.fileName);
      const newThumbnail = `${fileName.name}.jpg`;

      const data = new FormData();
      data.append('image', resizedImage, {
        filename: newThumbnail,
        contentType: 'image/jpeg',
        knownLength: resizedImage.length,
      });
      await siteApi.request(`/api/storage/data/media/public/${media.id}/${size}/${newThumbnail}`, {
        method: 'POST',
        body: data,
        formData: true,
      });

      newThumbnailMap[`${size}`] = `${size}/${newThumbnail}`;
    }

    // 4. Update media in DB
    const newMedia = await context.media.updateMediaThumbs(media.id, siteId, newThumbnailMap);

    context.response.body = {
      media: newMedia,
    };

    return;
  }

  context.response.body = {
    media,
  };
};
