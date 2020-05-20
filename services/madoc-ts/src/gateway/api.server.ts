import { ApiClient } from './api';
import { getServiceJwt } from './token';

const token = getServiceJwt();
const apiGateway = process.env.API_GATEWAY as string;

export const api = new ApiClient(apiGateway, token);
