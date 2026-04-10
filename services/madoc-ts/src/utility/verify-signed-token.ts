import { compactVerify, errors, jwtVerify, type JWTHeaderParameters, type JWTPayload, type KeyLike } from 'jose';
import { getPublicKey } from './jose-keys';

export type TokenReturn = {
  token: string;
  key: KeyLike;
  header: JWTHeaderParameters;
  payload: JWTPayload & {
    service?: boolean;
    scope?: string;
    iss_name?: string;
    name?: string;
    sub?: string;
    iss?: string;
    iat?: number;
    exp?: number;
  };
};

export async function verifySignedToken(token: string, ignoreExpired = false): Promise<TokenReturn | undefined> {
  try {
    const key = await getPublicKey();
    const { payload, protectedHeader } = await jwtVerify(token, key, {
      algorithms: ['RS256'],
      typ: 'JWT',
      clockTolerance: '1 min',
    });

    return {
      token,
      header: protectedHeader,
      payload: payload as TokenReturn['payload'],
      key,
    };
  } catch (e) {
    if (ignoreExpired && e instanceof errors.JWTExpired) {
      try {
        const key = await getPublicKey();
        const { payload, protectedHeader } = await compactVerify(token, key, {
          algorithms: ['RS256'],
        });
        const decodedPayload = JSON.parse(new TextDecoder().decode(payload));
        return {
          token,
          header: protectedHeader,
          payload: decodedPayload,
          key,
        };
      } catch (innerError) {
        // fallthrough
      }
    }
    // Catch errors, fallthrough to undefined.
  }

  return undefined;
}
