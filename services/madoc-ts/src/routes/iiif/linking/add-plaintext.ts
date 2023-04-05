import { api } from '../../../gateway/api.server';
import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';
import { linkHash } from './convert-linking';

export const addPlaintext: RouteMiddleware<{ id: number }, { plaintext: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const canvasId = Number(context.query.id);
  const plaintext = context.requestBody.plaintext;

  const siteApi = api.asUser({ siteId });
  const linking = await siteApi.getCanvasLinking(canvasId);

  if (!plaintext.trim()) {
    context.response.status = 200;
    context.response.body = { success: true, empty: true };
    return;
  }

  const matchingPlaintexts = linking.linking.filter(singleLink => {
    return singleLink.property === 'seeAlso' && singleLink.link.format === 'text/plain';
  });

  if (matchingPlaintexts.length) {
    for (const matchingPlaintext of matchingPlaintexts) {
      // Delete the existing one, and continue;
      await siteApi.deleteLinkingProperty(matchingPlaintext.id);
    }
  }

  // Create new plaintext and insert it.
  const bucket = 'plaintext';
  const filePath = `public/${canvasId}/${linkHash(plaintext)}.txt`;

  await siteApi.saveStoragePlainText(bucket, filePath, plaintext, true);

  await siteApi.addLinkToResource({
    label: 'Plaintext',
    link: {
      id: `/public/storage/urn:madoc:site:${siteId}/${bucket}/${filePath}`,
      format: 'text/plain',
      label: 'Plaintext',
      type: 'Text',
      file_path: `public/${canvasId}/${linkHash(plaintext)}.txt`,
      file_bucket: bucket,
    },
    resource_id: canvasId as any,
    property: 'seeAlso',
  });

  context.response.status = 200;
  context.response.body = { success: true, empty: false };
};
