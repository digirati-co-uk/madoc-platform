// List all of the files in a bucket.
import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';

export const getBucketFiles: RouteMiddleware = async context => {
  const isAdmin = context.state.jwt.scope.indexOf('site.admin') !== -1;
  const rootBucket = context.state.jwt.context.join('/');

  if (!isAdmin || !rootBucket) {
    throw new NotFound();
  }

  const storage = context.storage.disk('local');

  const bucket = context.params.bucket;
  const prefix = `${rootBucket}/${bucket}`;
  const totalFiles = storage.flatList(prefix);
  let total = 0;
  const files = [];
  for await (const file of totalFiles) {
    total += 1;
    files.push(file.path.slice(prefix.length));
  }

  context.response.body = {
    name: bucket,
    driver: 'local',
    total_files: total,
    files,
  };
};
