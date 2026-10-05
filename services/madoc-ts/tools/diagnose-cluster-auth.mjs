// Run: node services/madoc-ts/tools/diagnose-cluster-auth.mjs
// Uses actual Madoc RSA/JWT/cookie helpers in five isolated Node processes.
// Only the unrelated ApiClient invalidation import is stubbed.
import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, rm, readdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { generateKeyPairSync } from 'node:crypto';

const pkg = fileURLToPath(new URL('../', import.meta.url));
const pnpm = path.join(pkg, 'node_modules/.pnpm');
const esbuildDir = (await readdir(pnpm)).find(name => /^esbuild@/.test(name));
const { build } = (await import(pathToFileURL(path.join(pnpm, esbuildDir, 'node_modules/esbuild/lib/main.js')))).default;
const temporary = await mkdtemp(path.join(tmpdir(), 'madoc-auth-check-'));
await symlink(path.join(pkg, 'node_modules'), path.join(temporary, 'node_modules'));
const utility = path.join(pkg, 'src/utility');
const entry = ['gen-rsa', 'sync-jwt-requests', 'generate-keys', 'create-signed-token', 'verify-signed-token']
  .map(name => `export * from ${JSON.stringify(path.join(utility, `${name}.ts`))};`).join('\n');
await build({
  stdin: { contents: entry, resolveDir: pkg, loader: 'ts' },
  outfile: path.join(temporary, 'helpers.mjs'), bundle: true, platform: 'node', format: 'esm', packages: 'external',
  plugins: [{ name: 'skip-unrelated-api-client', setup(builder) {
    builder.onResolve({ filter: /gateway\/api\.server$/ }, () => ({ path: 'api-stub', namespace: 'stub' }));
    builder.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const api = { invalidateJwt() {} };' }));
  }}],
});
await writeFile(path.join(temporary, 'worker.mjs'), `
import * as auth from './helpers.mjs';
import Koa from 'koa';
process.send({ready: true});
process.on('message', async message => {
  try {
    if (message.start) {
      await auth.genRSA();
      await auth.syncJwtRequests();
      const token = await auth.createSignedToken({scope: ['site.view'], site: {id: 1, name: 'Test'}, user: {id: 1, name: 'Test'}, expiresIn: 3600});
      const app = new Koa();
      app.keys = auth.generateKeys();
      app.use(async context => {
        if (context.path === '/login') {
          context.cookies.set('madoc/test', token, {signed: true, path: '/'});
          context.body = 'logged in';
        } else {
          const cookie = context.cookies.get('madoc/test', {signed: true});
          context.body = {loggedIn: !!cookie && !!(await auth.verifySignedToken(cookie))};
        }
      });
      const server = app.listen(0, '127.0.0.1', () => process.send({token, cookieKey: app.keys[0], port: server.address().port}));
    } else {
      const accepted = await Promise.all(message.tokens.map(async token => !!(await auth.verifySignedToken(token))));
      process.send({accepted});
    }
  } catch (error) { process.send({error: String(error)}); }
});
`);

async function scenario(name, seed) {
  const dir = path.join(temporary, name);
  for (const child of ['keys', 'requests', 'responses']) await mkdir(path.join(dir, child), {recursive: true});
  if (seed) {
    const pair = generateKeyPairSync('rsa', {modulusLength: 2048,
      publicKeyEncoding: {type: 'spki', format: 'pem'},
      privateKeyEncoding: {type: seed === 'legacy' ? 'pkcs1' : 'pkcs8', format: 'pem'}});
    await writeFile(path.join(dir, 'keys/madoc.key'), pair.privateKey);
    const publicKey = seed === 'mismatched'
      ? generateKeyPairSync('rsa', {modulusLength: 2048, publicKeyEncoding: {type: 'spki', format: 'pem'}, privateKeyEncoding: {type: 'pkcs8', format: 'pem'}}).publicKey
      : pair.publicKey;
    await writeFile(path.join(dir, 'keys/madoc.pub'), publicKey);
  }
  await writeFile(path.join(dir, 'requests/test.json'), JSON.stringify({scope: ['site.view'], service: {id: 'test', name: 'Test'}}));
  const workers = Array.from({length: 5}, (_, index) => fork(path.join(temporary, 'worker.mjs'), [], {
    env: {...process.env, NODE_APP_INSTANCE: String(index), MADOC_KEY_PATH: path.join(dir, 'keys'), JWT_REQUEST_DIR: path.join(dir, 'requests'), JWT_RESPONSE_DIR: path.join(dir, 'responses')},
    stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
  }));
  const receive = worker => new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Worker timed out')), 30000);
    worker.once('message', message => {clearTimeout(timeout); message.error ? reject(new Error(message.error)) : resolve(message);});
  });
  try {
    await Promise.all(workers.map(receive));
    const issued = workers.map(receive);
    workers.forEach(worker => worker.send({start: true}));
    const identities = await Promise.all(issued);
    const verified = workers.map(receive);
    workers.forEach(worker => worker.send({tokens: identities.map(identity => identity.token)}));
    const matrix = (await Promise.all(verified)).map(result => result.accepted.map(Boolean));
    const cookieMatrix = [];
    for (const issuer of identities) {
      const response = await fetch(`http://127.0.0.1:${issuer.port}/login`);
      const cookie = response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
      cookieMatrix.push(await Promise.all(identities.map(async receiver => {
        const state = await fetch(`http://127.0.0.1:${receiver.port}/whoami`, {headers: {cookie}});
        return (await state.json()).loggedIn;
      })));
    }
    const result = {name, cookieSigningKeys: new Set(identities.map(identity => identity.cookieKey)).size,
      acceptedJwtPairs: matrix.flat().filter(Boolean).length, totalJwtPairs: 25, matrix,
      authenticatedCookiePairs: cookieMatrix.flat().filter(Boolean).length, cookieMatrix};
    console.log(JSON.stringify(result));
    assert.equal(result.cookieSigningKeys, 1);
    assert.equal(result.acceptedJwtPairs, 25);
    assert.equal(result.authenticatedCookiePairs, 25);
    return result;
  } finally { workers.forEach(worker => worker.kill()); }
}

try {
  await scenario('stable-shared-key', 'stable');
  await scenario('cold-start');
  await scenario('legacy-key-upgrade', 'legacy');
  await scenario('mismatched-keypair', 'mismatched');
} finally { await rm(temporary, {recursive: true, force: true}); }
