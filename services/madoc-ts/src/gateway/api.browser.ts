import cookies from 'browser-cookies';
import { ApiClient } from './api';

const [, slug] = window.location.pathname.match(/s\/([^/]*)/) as string[];
const jwt = cookies.get(`madoc/${slug}`);

if (!jwt) {
  const loc = window.location.href;
  window.location.href = `/s/${slug}/madoc/login?redirect=${loc}`;
}

export const api = (jwt
  ? new ApiClient(`${window.location.protocol}//${window.location.host}`, jwt)
  : undefined) as ApiClient;
