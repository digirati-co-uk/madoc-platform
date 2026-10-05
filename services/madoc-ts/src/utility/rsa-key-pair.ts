import { createPublicKey } from 'crypto';
import { readFileSync } from 'fs';
import { importPKCS8, importSPKI } from 'jose';
import * as path from 'path';
import { OPEN_SSL_KEY_PATH } from '../paths';
import { clearPemCache } from './get-pem';
import { clearJoseKeyCache } from './jose-keys';

export async function hasValidKeyPair(publicKeyFile: string, privateKeyFile: string, reportErrors = true) {
  try {
    const privateKey = readFileSync(privateKeyFile, 'utf-8');
    const publicKey = readFileSync(publicKeyFile, 'utf-8');
    await importPKCS8(privateKey, 'RS256');
    await importSPKI(publicKey, 'RS256');
    const encoding = { type: 'spki', format: 'pem' } as const;
    if (createPublicKey(privateKey).export(encoding) !== createPublicKey(publicKey).export(encoding)) {
      throw new Error('Public and private keys do not match');
    }
    return true;
  } catch (err) {
    if (reportErrors) {
      console.warn('RSA: Existing keys are invalid or not PKCS#8/SPKI, regenerating...');
      if (err instanceof Error) {
        console.warn(`RSA: Key validation error: ${err.message}`);
      }
    }
    return false;
  }
}

export async function waitForRSA() {
  const publicKeyFile = path.join(OPEN_SSL_KEY_PATH, 'madoc.pub');
  const privateKeyFile = path.join(OPEN_SSL_KEY_PATH, 'madoc.key');
  const deadline = Date.now() + 30_000;
  while (!(await hasValidKeyPair(publicKeyFile, privateKeyFile, false))) {
    if (Date.now() >= deadline) {
      throw new Error('RSA: Timed out waiting for server instance 0 to initialize a matching keypair');
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  clearPemCache();
  clearJoseKeyCache();
}
