import { JWK, JWT } from 'jose';
import { readFileSync } from 'fs';

const publicKey = JWK.asKey(readFileSync('/openssl-certs/madoc.pub'));

export type TokenReturn = {
  token: string;
  key: JWK.Key;
  payload: {
    scope: string;
    iss_name: string;
    name: string;
    sub: string;
    iss: string;
    iat: number;
    exp: number;
  };
};

export function verifySignedToken(token: string): TokenReturn | undefined {
  const { payload, header, key } = JWT.verify(token, publicKey, {
    algorithms: ['RS256'],
    typ: 'JWT',
    clockTolerance: '1 min',
    complete: true,
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
