import { JWK, JWT } from 'jose';
import { readFileSync } from 'fs';

const key = JWK.asKey(readFileSync('/openssl-certs/madoc.key'));

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
