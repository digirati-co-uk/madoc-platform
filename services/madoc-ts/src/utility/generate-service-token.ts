import { SignJWT } from 'jose';
import { getPrivateKey } from './jose-keys';

export type ServiceTokenRequest = {
  scope: string[];
  service: {
    id: string;
    name: string;
  };
};

export async function generateServiceToken(req: ServiceTokenRequest) {
  try {
    const key = await getPrivateKey();
    return await new SignJWT({
      scope: req.scope ? req.scope.join(' ') : undefined,
      iss_name: 'Madoc Platform Gateway',
      name: req.service.name,
      service: true,
    })
      .setProtectedHeader({ typ: 'JWT', alg: 'RS256' })
      .setSubject(`urn:madoc:service:${req.service.id}`)
      .setIssuer(`urn:madoc:gateway`)
      .setIssuedAt()
      .sign(key);
  } catch (err) {
    console.log(err);
    return undefined;
  }
}
