import { existsSync, readFileSync } from 'fs';

// @todo path check.
export const readLocalSource = (localSource: string | null) => {
  if (!localSource) {
    return undefined;
  }

  if (existsSync(localSource)) {
    return JSON.parse(readFileSync(localSource).toString('utf-8'));
  }

  return undefined;
};
