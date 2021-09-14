import { JWK, JWT } from 'jose';
import { readFileSync } from 'fs';
import * as path from 'path';
import { OPEN_SSL_KEY_PATH } from '../paths';

const key = JWK.asKey(readFileSync(path.join(OPEN_SSL_KEY_PATH, 'madoc.key')));

export type TokenRequest = {
  scope?: string[];
  site?: {
    name: string;
    id: number;
  };
  user: {
    name: string;
    id: number;
  };
  expiresIn: number;
};

export function createLimitedSignedToken(req: {
  identifier: string;
  name: string;
  site: {
    name: string;
    id: number;
  };
  scope: string[];
  expiresIn: number;
  data?: any;
}) {
  try {
    return JWT.sign(
      {
        scope: req.scope ? req.scope.join(' ') : undefined,
        iss_name: req.site ? req.site.name : undefined,
        name: req.name,
        ...(req.data || {}),
      },
      key,
      {
        subject: req.identifier,
        issuer: req.site ? `urn:madoc:site:${req.site.id}` : `urn:madoc:site:admin`,
        header: {
          typ: 'JWT',
          alg: 'RS256',
        },
        expiresIn: `${req.expiresIn}s`,
      }
    );
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

export function createSignedToken(req: TokenRequest) {
  try {
    return JWT.sign(
      {
        scope: req.scope ? req.scope.join(' ') : undefined,
        iss_name: req.site ? req.site.name : undefined,
        name: req.user.name,
      },
      key,
      {
        subject: `urn:madoc:user:${req.user.id}`,
        issuer: req.site ? `urn:madoc:site:${req.site.id}` : `urn:madoc:site:admin`,
        header: {
          typ: 'JWT',
          alg: 'RS256',
        },
        expiresIn: `${req.expiresIn}s`,
      }
    );
  } catch (err) {
    console.log(err);
    return undefined;
  }
}
