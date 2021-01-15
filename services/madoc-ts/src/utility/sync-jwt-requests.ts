import { readdirSync, readFileSync, existsSync, writeFileSync } from 'fs';
import * as path from 'path';
import { generateServiceToken } from './generate-service-token';
import { verifySignedToken } from './verify-signed-token';

function getContents(dest: string) {
  return JSON.parse(readFileSync(dest).toString('utf-8'));
}

export async function syncJwtRequests() {
  const jwtRequests = process.env.JWT_REQUEST_DIR || path.join(__dirname, '..', '..', 'service-jwts');
  const jwtResponses = process.env.JWT_RESPONSE_DIR || path.join(__dirname, '..', '..', 'service-jwt-responses');
  const directory = readdirSync(jwtRequests);
  for (const file of directory) {
    if (file.endsWith('.json')) {
      const dest = path.join(jwtResponses, file);
      const exists = existsSync(dest);
      const contents = exists ? getContents(dest) : undefined;
      const oldToken = contents ? contents.token : undefined;
      const isValidToken = oldToken ? verifySignedToken(oldToken) : undefined;

      if (!isValidToken) {
        const request = readFileSync(path.join(jwtRequests, file)).toString('utf-8');
        const json = JSON.parse(request);
        const token = await generateServiceToken(json);
        if (token) {
          writeFileSync(path.join(jwtResponses, file), `{"token": "${token}"}`);
        }
      }
    }
  }
}
