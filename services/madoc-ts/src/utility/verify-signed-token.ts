import { JWK, JWT } from 'jose';
import { readFileSync } from 'fs';
import * as path from 'path';

const keyPath = process.env.MADOC_KEY_PATH || '/openssl-certs/';

const publicKey = JWK.asKey(readFileSync(path.join(keyPath, 'madoc.pub')));

export type TokenReturn = {
  token: string;
  key: JWK.Key;
  payload: {
    service: boolean;
    scope: string;
    iss_name: string;
    name: string;
    sub: string;
    iss: string;
    iat: number;
    exp: number;
  };
};

export function verifySignedToken(token: string, ignoreExpired = false): TokenReturn | undefined {
  const { payload, header, key } = JWT.verify(token, publicKey, {
    algorithms: ['RS256'],
    typ: 'JWT',
    clockTolerance: '1 min',
    complete: true,
    ignoreExp: ignoreExpired,
  });

  if (key && payload && header) {
    return {
      token,
      header,
      payload,
      key,
    } as TokenReturn;
  }

  return undefined;
}
