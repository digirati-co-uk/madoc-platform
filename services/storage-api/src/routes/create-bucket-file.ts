// Writes file at location, only if it does not exist.
import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import { getContent } from '../utility/get-content';
import { RequestError } from '../errors/request-error';

export const createBucketFile: RouteMiddleware<{ bucket: string; path: string }> = async (context) => {
  const isAdmin = context.state.jwt.scope.indexOf('site.admin') !== -1;
  const canWrite = isAdmin || context.state.jwt.scope.indexOf('files.write') !== -1;
  const rootBucket = context.state.jwt.context.join('/');

  if (!canWrite || !rootBucket) {
    throw new NotFound();
  }

  const storage = context.storage.disk();

  const bucket = context.params.bucket;
  const filePath = context.params.path;

  const content = getContent(context);

  if (content === null) {
    throw new RequestError();
  }

  const fullPath = `${rootBucket}/${bucket}/${filePath}`;
  await storage.put(fullPath, content);
  const { modified, size } = await storage.getStat(fullPath);
  context.response.body = {
    success: true,
    stats: {
      modified,
      size,
    },
  };
};
