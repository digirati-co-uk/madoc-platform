import { RouteMiddleware } from '../types';
import { JWK, JWT } from 'jose';
import { readFileSync } from 'fs';

export const keys: RouteMiddleware = async context => {
  const key = JWK.asKey(readFileSync('/openssl-certs/madoc.key'));

  context.response.body = JWT.sign(
    {
      scope: 'tasks.admin',
      iss_name: 'Example site',
      name: 'Test Admin User',
    },
    key,
    {
      subject: 'http://example.org/users/0',
      issuer: 'urn:madoc:1',
      header: {
        typ: 'JWT',
        alg: 'RS256',
      },
    }
  );
};
