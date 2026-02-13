import { generateKeyPairSync, RSAKeyPairOptions } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { importPKCS8, importSPKI } from 'jose';
import mkdirp from 'mkdirp';
import * as path from 'path';
import { OPEN_SSL_KEY_PATH } from '../paths';
import { clearPemCache } from './get-pem';
import { clearJoseKeyCache } from './jose-keys';
import { syncJwtRequests } from './sync-jwt-requests';

async function hasValidKeyPair(publicKeyFile: string, privateKeyFile: string) {
  try {
    const privateKey = readFileSync(privateKeyFile, 'utf-8');
    const publicKey = readFileSync(publicKeyFile, 'utf-8');

    // jose requires PKCS#8 for private keys and SPKI for public keys.
    await importPKCS8(privateKey, 'RS256');
    await importSPKI(publicKey, 'RS256');
    return true;
  } catch (err) {
    console.warn('RSA: Existing keys are invalid or not PKCS#8/SPKI, regenerating...');
    if (err instanceof Error) {
      console.warn(`RSA: Key validation error: ${err.message}`);
    }
    return false;
  }
}

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
    if (!(await hasValidKeyPair(publicKeyFile, privateKeyFile))) {
      force = true;
    }
  }

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
  clearJoseKeyCache();

  // Once complete, we need to refresh JWT requests.
  await syncJwtRequests();

  // Clear the cache for our own service.
  // Note other services may not know their token is invalid. But when it
  // does go invalid, the first thing they should do is to reload it from disk.
  // When this function is called dynamically, it's likely to cause some disruption.
  // And all users will be logged out. This is only temporary, the service will be
  // restarted (without downtime)
  (await import('../gateway/api.server')).api.invalidateJwt();
}
