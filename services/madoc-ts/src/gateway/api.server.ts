import { ApiClient } from './api';
import { getServiceJwt } from './token';

const apiGateway = process.env.API_GATEWAY as string;

export const api = new ApiClient({
  gateway: apiGateway,
  jwt: getServiceJwt,
});
