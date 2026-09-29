import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';

export const getFileDetails: RouteMiddleware = async (context) => {
  const isAdmin = context.state.jwt.scope.indexOf('site.admin') !== -1;
  const canRead = isAdmin || context.state.jwt.scope.indexOf('files.read') !== -1;
  const rootBucket = context.state.jwt.context.join('/');

  if (!canRead || !rootBucket) {
    throw new NotFound();
  }

  const storage = context.storage.disk();

  const bucket = context.params.bucket;
  const filePath = context.params.path;

  if (bucket.indexOf('..') !== -1 || filePath.indexOf('..') !== -1) {
    throw new NotFound('File not found');
  }

  const { size, modified } = await storage.getStat(`${rootBucket}/${bucket}/${filePath}`);

  const isPublic = filePath.startsWith('public/');

  if (isPublic) {
    context.response.body = {
      size,
      modified,
      public: true,
      public_url: `/public/storage/${rootBucket}/${bucket}/${filePath}`,
    };
  } else {
    context.response.body = { size, modified, public: filePath.startsWith('public/') };
  }
};
