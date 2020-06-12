import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import * as path from 'path';

export const getFileData: RouteMiddleware<{ bucket: string; path: string }> = async context => {
  const isAdmin = context.state.jwt.scope.indexOf('site.admin') !== -1;
  const canRead = isAdmin || context.state.jwt.scope.indexOf('files.read') !== -1;
  const rootBucket = context.state.jwt.context.join('/');

  if (!canRead || !rootBucket) {
    throw new NotFound();
  }

  const storage = context.storage.disk('local');

  const bucket = context.params.bucket;
  const filePath = context.params.path;

  const extension = path.extname(filePath);

  if (bucket.indexOf('..') !== -1 || filePath.indexOf('..') !== -1) {
    throw new NotFound('File not found');
  }

  context.body = await storage.getStream(`${rootBucket}/${bucket}/${filePath}`);

  switch (extension) {
    case '.txt':
      context.response.set('content-type', 'text/plain');
      break;
    case '.png':
      context.response.set('content-type', 'image/png');
      break;
    case '.jpg':
    case '.jpeg':
      context.response.set('content-type', 'image/jpg');
      break;
    case '.json':
      context.response.set('content-type', 'application/json');
      break;
  }
};
