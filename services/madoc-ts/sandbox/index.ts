import { ApiClient } from '../src/gateway/api';

// Set env.
const MADOC_URL = process.env.MADOC_URL;
const MADOC_SITE = process.env.MADOC_SITE;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

export async function getApi() {
  if (!MADOC_URL || !MADOC_SITE || !CLIENT_ID || !CLIENT_SECRET) {
    console.log('missing env');
    process.exit();
  }

  console.log(`Requesting key from: ${MADOC_URL}/s/${MADOC_SITE}/auth/api-token`);
  const response = await fetch(`${MADOC_URL}/s/${MADOC_SITE}/auth/api-token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  }).then(r => r.json());

  if (!response.token) throw new Error(response.error || 'Invalid credentials');

  return new ApiClient({
    gateway: MADOC_URL,
    publicSiteSlug: MADOC_SITE,
    jwt: response.token,
  });
}
