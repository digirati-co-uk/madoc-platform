import { readFileSync } from 'fs';
import path from 'path';
import { OPEN_SSL_KEY_PATH } from '../paths';

const fileCache: { pem: Buffer | null; publicPem: Buffer | null } = { pem: null, publicPem: null };

export function getPem(): Buffer {
  if (!fileCache.pem) {
    fileCache.pem = readFileSync(path.join(OPEN_SSL_KEY_PATH, 'madoc.key'));
  }
  return fileCache.pem;
}

export function getPublicPem() {
  if (!fileCache.publicPem) {
    fileCache.publicPem = readFileSync(path.join(OPEN_SSL_KEY_PATH, 'madoc.pub'));
  }
  return fileCache.publicPem;
}

export function clearPemCache() {
  fileCache.publicPem = null;
  fileCache.pem = null;
}
