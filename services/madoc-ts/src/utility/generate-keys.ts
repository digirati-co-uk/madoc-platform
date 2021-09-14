import { readFileSync } from 'fs';
import { createHmac } from 'crypto';
import path from 'path';
import { OPEN_SSL_KEY_PATH } from '../paths';

const pem = readFileSync(path.join(OPEN_SSL_KEY_PATH, 'madoc.key'));

const keys = process.env.COOKIE_KEYS || 'cookie_key_1,cookie_key_2,cookie_key_3';

export function generateKeys(): string[] {
  return keys.split(',').map(key =>
    createHmac('sha256', pem)
      .update(key)
      .digest('hex')
  );
}
