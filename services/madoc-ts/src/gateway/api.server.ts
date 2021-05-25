import { ApiClient } from './api';
import { getServiceJwt } from './token';

export const apiGateway = process.env.API_GATEWAY as string;
export const gatewayHost = process.env.GATEWAY_HOST || 'http://localhost:8888';

export const api = new ApiClient({
  gateway: apiGateway,
  jwt: getServiceJwt,
});
