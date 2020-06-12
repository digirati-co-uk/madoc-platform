import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';

export const getFileDetails: RouteMiddleware = async context => {
  const isAdmin = context.state.jwt.scope.indexOf('site.admin') !== -1;
  const canRead = isAdmin || context.state.jwt.scope.indexOf('files.read') !== -1;
  const rootBucket = context.state.jwt.context.join('/');

  if (!canRead || !rootBucket) {
    throw new NotFound();
  }

  const storage = context.storage.disk('local');

  const bucket = context.params.bucket;
  const filePath = context.params.path;

  if (bucket.indexOf('..') !== -1 || filePath.indexOf('..') !== -1) {
    throw new NotFound('File not found');
  }

  const { size, modified } = await storage.getStat(`${rootBucket}/${bucket}/${filePath}`);

  context.response.body = { size, modified, public: filePath.startsWith('public/') };
};
