import { createHmac } from 'crypto';
import { getPem } from './get-pem';

const keys = process.env.COOKIE_KEYS || 'cookie_key_1,cookie_key_2,cookie_key_3';

export function generateKeys(): string[] {
  return keys.split(',').map(key =>
    createHmac('sha256', getPem())
      .update(key)
      .digest('hex')
  );
}
