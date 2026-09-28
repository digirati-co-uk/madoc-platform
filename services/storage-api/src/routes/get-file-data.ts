import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import * as path from 'path';
import { getContentType } from '../utility/set-content-type';

export const getFileData: RouteMiddleware<{ bucket: string; path: string }> = async (context) => {
  const isAdmin = context.state.jwt.scope.indexOf('site.admin') !== -1;
  const canRead = isAdmin || context.state.jwt.scope.indexOf('files.read') !== -1;
  const rootBucket = context.state.jwt.context.join('/');

  if (!canRead || !rootBucket) {
    throw new NotFound();
  }

  const storage = context.storage.disk();

  const bucket = context.params.bucket;
  const filePath = context.params.path;

  const extension = path.extname(filePath);

  if (bucket.indexOf('..') !== -1 || filePath.indexOf('..') !== -1) {
    throw new NotFound('File not found');
  }

  context.body = await storage.getStream(`${rootBucket}/${bucket}/${filePath}`);

  const contentType = getContentType(extension);
  if (contentType) {
    context.response.set('content-type', contentType);
  }
};
