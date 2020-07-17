import { TypedRouter } from './utility/typed-router';
import { IndexPage } from './routes/index';
import { getFileData } from './routes/get-file-data';
import { getFileDetails } from './routes/get-file-details';
import { createBucketFile } from './routes/create-bucket-file';
import { getBucket } from './routes/get-bucket';
import { deleteBucketFile } from './routes/delete-file';
import { getBucketFiles } from './routes/get-bucket-files';
import { getPublicFile } from './routes/get-public-file';

export const router = new TypedRouter({
  // All tasks
  // 'get-all-tasks': [TypedRouter.GET, '/tasks', getAllTasks],
  index: [TypedRouter.GET, '/', IndexPage],
  'get-file': [TypedRouter.GET, '/api/storage/data/:bucket/:path+', getFileData],
  'get-file-details': [TypedRouter.GET, '/api/storage/details/:bucket/:path+', getFileDetails],
  'delete-file': [TypedRouter.DELETE, '/api/storage/details/:bucket/:path+', deleteBucketFile],
  'get-bucket': [TypedRouter.GET, '/api/storage/details/:bucket', getBucket],
  'create-bucket-file': [TypedRouter.POST, '/api/storage/data/:bucket/:path+', createBucketFile],
  'get-bucket-files': [TypedRouter.GET, '/api/storage/list/:bucket', getBucketFiles],
  'get-public-file': [TypedRouter.GET, '/public/storage/:rootBucket/:bucket/:path+', getPublicFile],
});
