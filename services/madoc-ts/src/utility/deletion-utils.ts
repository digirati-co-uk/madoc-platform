import fs from 'fs';

export function removeIiifFromDisk(path: string) {
  if (!fs.existsSync(path)) {
    throw new Error('Unable to find file at path ' + path);
  }
  fs.unlinkSync(path);
}
