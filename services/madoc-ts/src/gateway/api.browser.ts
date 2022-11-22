import cookies from 'browser-cookies';
import { ApiClient } from './api';

const [, slug] = window.location.pathname.match(/s\/([^/]*)/) as string[];
const jwt = cookies.get(`madoc/${slug}`) || undefined;

export const api = new ApiClient({
  gateway: `${window.location.protocol}//${window.location.host}`,
  jwt,
  publicSiteSlug: slug,
});

if (process.env.NODE_ENV !== 'production') {
  // @ts-ignore
  globalThis.MadocApi = api;
}
