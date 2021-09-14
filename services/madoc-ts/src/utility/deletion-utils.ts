import fs from 'fs';
import { FILES_PATH } from '../paths';

export function removeIiifFromDisk(path: string) {
  if (!fs.existsSync(path)) {
    throw new Error('Unable to find file at path ' + path);
  }
  if (!path.startsWith(`${FILES_PATH}/original/madoc-manifests`)) {
    throw new Error('Unable to delete file outside of IIIF directory');
  }
  fs.unlinkSync(path);
}
