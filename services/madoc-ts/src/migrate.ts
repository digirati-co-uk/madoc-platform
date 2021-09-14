import * as path from 'path';
import { ROOT_PATH } from './paths';
export async function migrate() {
  // @ts-ignore
  const { migrator } = require(path.resolve(ROOT_PATH, 'migrate'));

  return migrator.up() as any;
}
