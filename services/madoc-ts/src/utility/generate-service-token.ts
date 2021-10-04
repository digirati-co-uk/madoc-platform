import { JWK, JWT } from 'jose';
import { getPem } from './get-pem';

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
      JWK.asKey(getPem()),
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
