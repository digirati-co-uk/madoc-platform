import * as path from 'path';
import { readFileSync } from 'fs';
import { JWT_RESPONSE_PATH } from '../paths';

export function getServiceJwt() {
  const jwtPath = path.join(JWT_RESPONSE_PATH, 'madoc-ts.json');
  const jwtJsonString = readFileSync(jwtPath).toString('utf-8');
  return JSON.parse(jwtJsonString).token;
}
