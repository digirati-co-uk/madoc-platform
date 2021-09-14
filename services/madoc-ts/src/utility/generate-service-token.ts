import { JWK, JWT } from 'jose';
import { readFileSync } from 'fs';
import * as path from 'path';
import { OPEN_SSL_KEY_PATH } from '../paths';

const key = JWK.asKey(readFileSync(path.join(OPEN_SSL_KEY_PATH, 'madoc.key')));

export type ServiceTokenRequest = {
  scope: string[];
  service: {
    id: string;
    name: string;
  };
};

export function generateServiceToken(req: ServiceTokenRequest) {
  try {
    return JWT.sign(
      {
        scope: req.scope ? req.scope.join(' ') : undefined,
        iss_name: 'Madoc Platform Gateway',
        name: req.service.name,
        service: true,
      },
      key,
      {
        subject: `urn:madoc:service:${req.service.id}`,
        issuer: `urn:madoc:gateway`,
        header: {
          typ: 'JWT',
          alg: 'RS256',
        },
      }
    );
  } catch (err) {
    console.log(err);
    return undefined;
  }
}
