import { getServiceJwt } from './token';
import fetch from 'node-fetch';
const token = getServiceJwt();
const apiGateway = process.env.API_GATEWAY;

export async function makeJsonRequest<Return>(
  endpoint: string,
  {
    method = 'GET',
    body,
  }: { method?: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD'; body?: any } = {}
): Promise<Return> {
  const headers: any = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  if (body) {
    headers.ContentType = 'application/json';
  }

  return fetch(`${apiGateway}${endpoint}`, {
    headers,
    method,
    body: body ? JSON.stringify(body) : undefined,
  })
    .then(r => r.json())
    .catch(err => {
      console.log(err);
      throw err;
    });
}
