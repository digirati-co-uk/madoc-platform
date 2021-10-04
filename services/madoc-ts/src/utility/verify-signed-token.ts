import { JWK, JWT } from 'jose';
import { getPublicPem } from './get-pem';

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
  try {
    const { payload, header, key } = JWT.verify(token, JWK.asKey(getPublicPem()), {
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
  } catch (e) {
    // Catch errors, fallthrough to undefined.
  }

  return undefined;
}
