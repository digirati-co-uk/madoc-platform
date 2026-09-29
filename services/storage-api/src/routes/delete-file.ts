import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';

export const deleteBucketFile: RouteMiddleware = async (context) => {
  const isAdmin = context.state.jwt.scope.indexOf('site.admin') !== -1;
  const rootBucket = context.state.jwt.context.join('/');

  if (!isAdmin || !rootBucket) {
    throw new NotFound();
  }

  const storage = context.storage.disk();

  const bucket = context.params.bucket;
  const filePath = context.params.path;

  if (bucket.indexOf('..') !== -1 || filePath.indexOf('..') !== -1) {
    throw new NotFound('File not found');
  }

  await storage.delete(`${rootBucket}/${bucket}/${filePath}`);
  context.response.status = 200;
};
