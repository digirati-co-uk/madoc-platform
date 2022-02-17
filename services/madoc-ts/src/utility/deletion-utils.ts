import fs from 'fs';
import { FILES_PATH } from '../paths';

export async function removeIiifFromDisk(path: string) {
  if (!fs.existsSync(path)) {
    return;
  }
  if (!path.startsWith(`${FILES_PATH}/original/madoc-manifests`)) {
    throw new Error('Unable to delete file outside of IIIF directory');
  }
  await fs.promises.unlink(path);
}
