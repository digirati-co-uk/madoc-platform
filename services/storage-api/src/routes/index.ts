import { RouteMiddleware } from '../types';
import { LocalFileSystemStorage } from '@slynova/flydrive';

export const IndexPage: RouteMiddleware = async context => {
  const storage = context.storage.disk<LocalFileSystemStorage>('local');

  const result = await storage.put('some-bucket/test-2.txt', JSON.stringify({ test: 'object' }));

  console.log(result);
  const files = [];
  for await (const file of storage.flatList()) {
    files.push({
      file,
      stat: await storage.getStat(file.path),
    });
  }

  context.response.body = {
    contents: JSON.parse((await storage.get('some-bucket/test.txt')).content),
    files,
  };
};
