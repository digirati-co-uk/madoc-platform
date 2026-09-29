import { createHmac } from 'crypto';

export function mockJWT(claims: { name: string; scope: string; iss: string; sub: string }) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('This is a mock function only to be used for testing');
  }

  const headers = Buffer.from(
    JSON.stringify({
      alg: 'HS256',
      typ: 'JWT',
    })
  ).toString('base64');

  const payload = Buffer.from(JSON.stringify(claims)).toString('base64');
  const hmac = createHmac('sha256', 'ThisIsOnlyUsedForTesting');
  const data = hmac.update(`${headers}.${payload}`);
  const signature = data.digest('hex');
  const encodedSignature = Buffer.from(signature).toString('base64');

  return `${headers}.${payload}.${encodedSignature}`;
}
