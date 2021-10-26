import { generateKeyPairSync, RSAKeyPairOptions } from 'crypto';
import { existsSync, writeFileSync } from 'fs';
import mkdirp from 'mkdirp';
import * as path from 'path';
import { OPEN_SSL_KEY_PATH } from '../paths';
import { clearPemCache } from './get-pem';
import { syncJwtRequests } from './sync-jwt-requests';

export async function genRSA(force = false) {
  if (!existsSync(OPEN_SSL_KEY_PATH)) {
    await mkdirp(OPEN_SSL_KEY_PATH);
  }

  const publicKeyFile = path.join(OPEN_SSL_KEY_PATH, 'madoc.pub');
  const privateKeyFile = path.join(OPEN_SSL_KEY_PATH, 'madoc.key');

  const publicExists = existsSync(publicKeyFile);
  const privateExists = existsSync(privateKeyFile);

  console.log('RSA: Checking Keypair exists');

  if (publicExists && privateExists && !force) {
    console.log('RSA: Keys exists, skipping...');
    return;
  }

  console.log('RSA: Generating new keypair...');
  const publicKeyEncoding = {
    type: 'spki',
    format: 'pem',
  } as const;

  const privateKeyEncoding = {
    type: 'pkcs8',
    format: 'pem',
  } as const;

  const options: RSAKeyPairOptions<'pem', 'pem'> = {
    modulusLength: 2048,
    privateKeyEncoding,
    publicKeyEncoding,
  };

  const { publicKey, privateKey } = generateKeyPairSync('rsa', options);

  writeFileSync(publicKeyFile, publicKey);
  writeFileSync(privateKeyFile, privateKey);

  // Clear the cache, so we can re-sync the JWT requests.
  clearPemCache();

  // Once complete, we need to refresh JWT requests.
  await syncJwtRequests();

  // Clear the cache for our own service.
  // Note other services may not know their token is invalid. But when it
  // does go invalid, the first thing they should do is to reload it from disk.
  // When this function is called dynamically, it's likely to cause some disruption.
  // And all users will be logged out. This is only temporary, the service will be
  // restarted (without downtime)
  require('../gateway/api.server').api.invalidateJwt();
}
