import * as path from 'path';
import { readFileSync } from 'fs';

export function getServiceJwt() {
  const jwtResponses = process.env.JWT_RESPONSE_DIR || path.join(__dirname, '..', '..', 'service-jwt-responses');
  const jwtPath = path.join(jwtResponses, 'madoc-ts.json');
  const jwtJsonString = readFileSync(jwtPath).toString('utf-8');
  return JSON.parse(jwtJsonString).token;
}
