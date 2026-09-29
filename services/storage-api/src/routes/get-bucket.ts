// Get bucket details.
// - name (from URL)
// - driver
// - number of files.
import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';

export const getBucket: RouteMiddleware<{ bucket: string }> = async (context) => {
  const isAdmin = context.state.jwt.scope.indexOf('site.admin') !== -1;
  const rootBucket = context.state.jwt.context.join('/');

  if (!isAdmin || !rootBucket) {
    throw new NotFound();
  }

  const storage = context.storage.disk();

  const bucket = context.params.bucket;
  const totalFiles = storage.flatList(`${rootBucket}/${bucket}`);
  let total = 0;
  for await (const file of totalFiles) {
    total += 1;
  }

  context.response.body = {
    name: bucket,
    driver: 'local',
    total_files: total,
  };
};
