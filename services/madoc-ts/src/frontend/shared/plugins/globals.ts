import * as publicApi from './public-api';

export const Madoc = publicApi;

// @ts-ignore
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.Madoc = publicApi;
} else {
  // @ts-ignore
  global.Madoc = publicApi;
}
