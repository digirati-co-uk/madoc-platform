import fs from 'fs';

const fileDirectory = process.env.OMEKA_FILE_DIRECTORY || '/home/node/app/omeka-files';

export function removeIiifFromDisk(path: string) {
  if (!fs.existsSync(path)) {
    throw new Error('Unable to find file at path ' + path);
  }
  if (!path.startsWith(`${fileDirectory}/original/madoc-manifests`)) {
    throw new Error('Unable to delete file outside of IIIF directory');
  }
  fs.unlinkSync(path);
}
