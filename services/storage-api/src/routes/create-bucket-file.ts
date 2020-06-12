// Writes file at location, only if it does not exist.
import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import * as fs from 'fs';

export const createBucketFile: RouteMiddleware<{ bucket: string; path: string }> = async context => {
  const isAdmin = context.state.jwt.scope.indexOf('site.admin') !== -1;
  const canWrite = isAdmin || context.state.jwt.scope.indexOf('files.write') !== -1;
  const rootBucket = context.state.jwt.context.join('/');

  if (!canWrite || !rootBucket) {
    throw new NotFound();
  }

  const storage = context.storage.disk('local');

  const bucket = context.params.bucket;
  const filePath = context.params.path;

  const image = context.request.files ? context.request.files.image : undefined;

  if (image) {
    const fullPath = `${rootBucket}/${bucket}/${filePath}`;
    await storage.put(fullPath, fs.readFileSync(image.path));
    const { modified, size } = await storage.getStat(fullPath);
    context.response.body = {
      success: true,
      stats: {
        modified,
        size,
      },
    };
    return;
  }
};
