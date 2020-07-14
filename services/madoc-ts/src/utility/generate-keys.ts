import { readFileSync } from 'fs';
import { createHmac } from 'crypto';
import { JWK } from 'jose';
import path from 'path';

const keyPath = process.env.MADOC_KEY_PATH || '/openssl-certs/';

const pem = readFileSync(path.join(keyPath, 'madoc.key'));

const keys = process.env.COOKIE_KEYS || 'cookie_key_1,cookie_key_2,cookie_key_3';

export function generateKeys(): string[] {
  return keys.split(',').map(key =>
    createHmac('sha256', pem)
      .update(key)
      .digest('hex')
  );
}
