import { readdirSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import { generateServiceToken } from './generate-service-token';

export async function syncJwtRequests() {
  const jwtRequests = process.env.JWT_REQUEST_DIR || path.join(__dirname, '..', '..', 'service-jwts');
  const jwtResponses = process.env.JWT_RESPONSE_DIR || path.join(__dirname, '..', '..', 'service-jwt-responses');
  const directory = readdirSync(jwtRequests);
  for (const file of directory) {
    if (file.endsWith('.json')) {
      const request = readFileSync(path.join(jwtRequests, file)).toString('utf-8');
      const json = JSON.parse(request);
      const token = await generateServiceToken(json);
      if (token) {
        writeFileSync(path.join(jwtResponses, file), `{"token": "${token}"}`);
      }
    }
  }
}
