import * as fs from 'fs';
import { NotFound } from '../../errors/not-found';
import { RouteMiddleware } from '../../types';
import * as path from 'path';
import sharp from 'sharp';
import NodeStreamZip from 'node-stream-zip';
import cache from 'memory-cache';
import mkdirp from 'mkdirp';

export const getLevel0File: RouteMiddleware = async (context) => {
  const storage = context.storage.disk();

  if (!context.enableIIIF) {
    context.response.status = 404;
    return;
  }

  const bucket = context.params.bucket;
  const requestedPath = context.params.path;
  const rootBucket = context.params.rootBucket;

  if (bucket.indexOf('..') !== -1 || requestedPath.indexOf('..') !== -1) {
    throw new NotFound('File not found');
  }
  // Split the path correctly.

  const extension = requestedPath.indexOf('.');
  const afterPath = requestedPath.slice(extension);
  const iiifQueryPosition = afterPath.indexOf('/');

  if (extension === -1 || iiifQueryPosition === -1) {
    context.response.status = 404;
    return;
  }

  const filePath = requestedPath.slice(0, extension + iiifQueryPosition);
  const iiifPath = requestedPath.slice(extension + iiifQueryPosition) || '/info.json';
  const fileDetails = path.parse(filePath);

  const name = fileDetails.name;
  const zipName = `${fileDetails.name}.zip`;
  const zipPath = `${rootBucket}/${bucket}/iiif/${fileDetails.dir}/${zipName}`;
  const fullZipPath = path.resolve(context.localDisk, zipPath);
  const fullZipDir = path.resolve(context.localDisk, `${rootBucket}/${bucket}/iiif/${fileDetails.dir}`);
  const fullFilePath = `${rootBucket}/${bucket}/${filePath}`;

  const fileExists = await storage.exists(fullFilePath);

  if (!fileExists) {
    context.response.status = 404;
    return;
  }

  const zipExists = fs.existsSync(fullZipPath);

  if (!zipExists) {
    try {
      // Create folder.
      await mkdirp(fullZipDir);

      const imageStream = await storage.getBuffer(fullFilePath);
      const inputImage = sharp(imageStream.content);
      await inputImage
        .tile({
          layout: 'iiif' as any,
          size: 256,
        })
        .toFile(fullZipPath);
    } catch (err) {
      console.log(err);
      context.response.status = 500;
      return;
    }
  }

  async function getZip(): Promise<NodeStreamZip> {
    // @todo swap to use least-recently-used cache: https://www.npmjs.com/package/lru-cache
    const key = `iiif:zip:${fullZipPath}`;
    const zip: NodeStreamZip = cache.get(key);
    if (zip) {
      return zip;
    }

    const newZip = new NodeStreamZip({ file: fullZipPath });
    await new Promise<void>((resolve) => newZip.on('ready', resolve));
    cache.put(key, newZip, 5 * 60 * 1000); // 5 minute cache.

    return newZip;
  }

  const zip = await getZip();

  if (iiifPath === '/info.json') {
    context.response.set('content-type', 'application/json');
    const info = JSON.parse(zip.entryDataSync(`${name}${iiifPath}`).toString('utf-8'));

    // Patch the ID with current gateway host.
    info['@id'] = `${context.gatewayHost}${decodeURIComponent(
      `/public/storage/iiif/0/${rootBucket}/${bucket}/${filePath}`
    )}`;
    context.response.body = info;
  } else {
    context.response.set('content-type', 'image/jpeg');
    context.response.body = zip.entryDataSync(`${name}${iiifPath}`);
  }
};
