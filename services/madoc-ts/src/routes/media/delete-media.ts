import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const deleteMedia: RouteMiddleware<{ mediaId: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const siteApi = api.asUser({ siteId });

  try {
    const mediaItem = await context.media.getMediaById(context.params.mediaId, siteId);

    // Delete from storage api.
    const filesToDelete = [
      // The main item
      mediaItem.id + '/' + mediaItem.fileName,
    ];

    const thumbKeys = Object.keys(mediaItem.thumbnails || {});
    for (const thumbKey of thumbKeys) {
      filesToDelete.push(mediaItem.id + '/' + thumbKey + '/' + mediaItem.fileName);
    }

    for (const fileToDelete of filesToDelete) {
      await siteApi.deleteStorageItem('media', fileToDelete, true);
    }

    await context.media.deleteMedia(context.params.mediaId, siteId);
  } catch (err) {
    // Silent error - already deleted.
  }

  context.response.status = 204;
};
