import { SignJWT } from 'jose';
import { getPrivateKey } from './jose-keys';

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

export async function createLimitedSignedToken(req: {
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
    const key = await getPrivateKey();
    return await new SignJWT({
      scope: req.scope ? req.scope.join(' ') : undefined,
      iss_name: req.site ? req.site.name : undefined,
      name: req.name,
      ...(req.data || {}),
    })
      .setProtectedHeader({ typ: 'JWT', alg: 'RS256' })
      .setSubject(req.identifier)
      .setIssuer(req.site ? `urn:madoc:site:${req.site.id}` : `urn:madoc:site:admin`)
      .setIssuedAt()
      .setExpirationTime(`${req.expiresIn}s`)
      .sign(key);
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

export async function createSignedToken(req: TokenRequest) {
  try {
    const key = await getPrivateKey();
    return await new SignJWT({
      scope: req.scope ? req.scope.join(' ') : undefined,
      iss_name: req.site ? req.site.name : undefined,
      name: req.user.name,
    })
      .setProtectedHeader({ typ: 'JWT', alg: 'RS256' })
      .setSubject(`urn:madoc:user:${req.user.id}`)
      .setIssuer(req.site ? `urn:madoc:site:${req.site.id}` : `urn:madoc:site:admin`)
      .setIssuedAt()
      .setExpirationTime(`${req.expiresIn}s`)
      .sign(key);
  } catch (err) {
    console.log(err);
    return undefined;
  }
}
