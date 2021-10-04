import { readdirSync, readFileSync, existsSync, writeFileSync } from 'fs';
import * as path from 'path';
import { JWT_REQUEST_PATH, JWT_RESPONSE_PATH } from '../paths';
import { generateServiceToken } from './generate-service-token';
import { verifySignedToken } from './verify-signed-token';

function getContents(dest: string) {
  try {
    return JSON.parse(readFileSync(dest).toString('utf-8'));
  } catch (err) {
    return undefined;
  }
}

export async function syncJwtRequests() {
  const directory = readdirSync(JWT_REQUEST_PATH);
  for (const file of directory) {
    if (file.endsWith('.json')) {
      const dest = path.join(JWT_RESPONSE_PATH, file);
      const exists = existsSync(dest);
      const contents = exists ? getContents(dest) : undefined;
      const oldToken = contents ? contents.token : undefined;
      const isValidToken = oldToken ? verifySignedToken(oldToken) : undefined;

      if (!isValidToken) {
        const request = readFileSync(path.join(JWT_REQUEST_PATH, file)).toString('utf-8');
        const json = JSON.parse(request);
        const token = await generateServiceToken(json);
        if (token) {
          console.log(`Writing new token for ${file}`);
          writeFileSync(path.join(JWT_RESPONSE_PATH, file), `{"token": "${token}"}`);
        }
      }
    }
  }
}
