// Run: node tools/diagnose-pm2-reload.cjs
// Uses an isolated PM2 daemon and temporary HTTP workers; never controls Madoc.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'madoc-pm2-reload-'));
const esbuild = require(require.resolve('esbuild', {paths: [path.dirname(require.resolve('vite/package.json'))]}));
esbuild.buildSync({
  entryPoints: [path.join(__dirname, '../src/utility/graceful-server-shutdown.ts')],
  outfile: path.join(directory, 'shutdown.cjs'), bundle: true, platform: 'node', format: 'cjs',
});
process.env.PM2_HOME = path.join(directory, 'pm2');
const pm2 = require('pm2');
const call = (method, ...args) => new Promise((resolve, reject) => {
  pm2[method](...args, (error, result) => error ? reject(error) : resolve(result));
});

fs.writeFileSync(path.join(directory, 'worker.cjs'), `
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {registerGracefulServerShutdown} = require('./shutdown.cjs');
let activeRequests = 0;
const server = http.createServer((request, response) => {
  activeRequests++;
  response.writeHead(200, {'x-worker-pid': String(process.pid)});
  response.flushHeaders();
  const complete = () => { activeRequests--; response.end('complete'); };
  if (request.url === '/slow') setTimeout(complete, 2000);
  else complete();
});
setTimeout(() => server.listen(Number(process.env.REVIEW_PORT), '127.0.0.1', () => {
  process.send('ready');
}), 300);
if (process.env.REVIEW_DRAIN === 'true') {
  registerGracefulServerShutdown(server,
    () => fs.writeFileSync(path.join(__dirname, 'stopped-' + process.pid), 'true'),
    async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      fs.writeFileSync(path.join(__dirname, 'closed-' + process.pid), JSON.stringify({activeRequests}));
    });
} else {
  process.on('SIGINT', () => process.exit(0)); // Previous Madoc shutdown behaviour.
}
`);

async function getPort() {
  const server = http.createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}

function request(port, route, onHeaders = () => {}) {
  return new Promise(resolve => {
    const pending = http.get({hostname: '127.0.0.1', port, path: route, agent: false}, response => {
      onHeaders(Number(response.headers['x-worker-pid']));
      response.resume();
      response.on('end', () => resolve({ok: response.statusCode === 200}));
      response.on('error', error => resolve({ok: false, error: error.code}));
      response.on('aborted', () => resolve({ok: false, error: 'aborted'}));
    });
    pending.on('error', error => resolve({ok: false, error: error.code}));
    pending.setTimeout(5000, () => pending.destroy(new Error('request timeout')));
  });
}

async function check(instances, drain) {
  const port = await getPort();
  const name = `review-${instances}-${drain}`;
  await call('start', {
    name, script: path.join(directory, 'worker.cjs'), exec_mode: 'cluster', instances,
    wait_ready: true, listen_timeout: 5000, kill_timeout: 5000,
    env: {REVIEW_PORT: String(port), REVIEW_DRAIN: String(drain)},
  });
  let resolveHeaders;
  const headers = new Promise(resolve => { resolveHeaders = resolve; });
  const slow = request(port, '/slow', resolveHeaders);
  const pid = await headers;
  const workers = await call('list');
  const target = workers.find(worker => worker.pid === pid).pm_id;
  const probes = [];
  const interval = setInterval(() => probes.push(request(port, '/')), 25);
  try {
    await call('reload', target);
  } finally {
    clearInterval(interval);
  }
  const slowResult = await slow;
  const results = await Promise.all(probes);
  const failedProbes = results.filter(result => !result.ok).length;
  console.log(JSON.stringify({instances, drain, slowResult, probes: results.length, failedProbes}));
  assert.equal(slowResult.ok, drain, 'In-flight request must survive only with draining');
  if (drain) assert.equal(failedProbes, 0, 'Draining replacement must serve new requests');
  if (drain) {
    assert.equal(fs.existsSync(path.join(directory, `stopped-${pid}`)), true, 'Shutdown must stop background jobs');
    const resources = JSON.parse(fs.readFileSync(path.join(directory, `closed-${pid}`), 'utf8'));
    assert.equal(resources.activeRequests, 0, 'Resources must close after in-flight requests finish');
  }
  await call('delete', name);
}

(async () => {
  try {
    await call('connect');
    for (const instances of [1, 4]) {
      await check(instances, false);
      await check(instances, true);
    }
  } finally {
    try { await call('killDaemon'); } finally {
      pm2.disconnect();
      fs.rmSync(directory, {recursive: true, force: true});
    }
  }
})().then(() => process.exit(0), error => { console.error(error); process.exit(1); });
