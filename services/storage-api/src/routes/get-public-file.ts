// Stream file, if configuration sets bucket to be public
// Static for now - bucket/public
import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import path from 'path';
import { getContentType } from '../utility/set-content-type';

export const getPublicFile: RouteMiddleware<{ bucket: string; path: string; rootBucket: string }> = async (context) => {
  const storage = context.storage.disk();

  const bucket = context.params.bucket;
  const filePath = context.params.path;
  const rootBucket = context.params.rootBucket;

  if (bucket.indexOf('..') !== -1 || filePath.indexOf('..') !== -1) {
    throw new NotFound('File not found');
  }

  // This is where the logic for if it was public. Here its by convention. bucket/public/...
  if (!filePath.startsWith('public/')) {
    throw new NotFound();
  }

  const extension = path.extname(filePath);

  context.body = await storage.getStream(`${rootBucket}/${bucket}/${filePath}`);

  const contentType = getContentType(extension);
  if (contentType) {
    context.response.set('content-type', contentType);
  }
};
