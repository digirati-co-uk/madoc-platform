// Run: node --expose-gc services/madoc-ts/tools/diagnose-api-client-lifetimes.cjs [client-count]
// Loads the actual ApiClient and its full source graph. No HTTP calls, no production source edits.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const service = path.resolve(__dirname, '..');
const mode = 'current';
const total = Number(process.argv[2] || 10000);
assert(global.gc, 'Run with --expose-gc');
const shim = fs.readFileSync(path.join(service, 'node_modules/.bin/esbuild'), 'utf8');
const esbuild = require(path.dirname(path.dirname(shim.match(/# cmd-shim-target=(.+)/)[1])));
const outfile = path.join(service, `.registry-measure-${process.pid}.cjs`);
const round = n => Number(n.toFixed(3));
const mib = n => round(n / 1024 / 1024);

(async () => {
  await esbuild.build({
    stdin: {
      contents: 'export {ApiClient} from "./src/gateway/api"; export {RegistryExtension, registryHistoryCount} from "./src/extensions/registry-extension";',
      resolveDir: service,
      loader: 'ts',
    },
    bundle: true, platform: 'node', format: 'cjs', packages: 'external', outfile,
    loader: { '.css': 'empty', '.svg': 'empty', '.png': 'empty', '.scss': 'empty', '.woff2': 'empty' },
    plugins: [{ name: 'measurement-only', setup(build) {
      build.onLoad({ filter: /registry-extension\.ts$/ }, ({ path: file }) => {
        let contents = fs.readFileSync(file, 'utf8');
        if (file.endsWith('registry-extension.ts')) {
          contents += '\nexport const registryHistoryCount = () => PRE_EVENTS.size;';
        }
        return {contents, loader: 'ts'};
      });
    }}],
  });
  // Match the production bundler's CJS/ESM interop and skip external UI styles.
  require.extensions['.css'] = () => {};
  const load = Module._load;
  Module._load = function(id, ...args) {
    const value = load.call(this, id, ...args);
    return id === 'styled-components' ? Object.assign(value.default, value) : value;
  };
  const {ApiClient, RegistryExtension, registryHistoryCount} = require(outfile);
  Module._load = load;
  const emitter = RegistryExtension.emitter;
  const listeners = () => Object.fromEntries([...emitter.all.entries()].map(([key, values]) => [key, values.length]));
  let api = new ApiClient({gateway: 'http://measurement.invalid', asUser: {siteId: 1, userId: 1}});
  assert(api.projectTemplates.getAllDefinitions(1).length >= 5);
  assert.equal(api.projectExport.getAllDefinitions(1).length, 8);
  const initialListeners = listeners();
  assert.equal(await api.asUserWithExtensions(async () => 42, {siteId: 1}), 42);
  await assert.rejects(api.asUserWithExtensions(async () => {throw new Error('callback failure');}, {siteId:1}), /callback failure/);
  assert.deepEqual(listeners(), initialListeners);
  api.debugRequests.push({retained: true});
  api.dispose();
  assert.equal(api.projectExport.api, null);
  assert.equal(api.webhooks.api, null);
  assert.equal(api.debugRequests.length, 0);
  api = null;
  const partial = new ApiClient({gateway: 'http://measurement.invalid', withoutExtensions: true});
  partial.dispose();
  assert.equal(partial.tasks.api, null);
  assert.equal(partial.notifications.api, null);
  let debugNotifications = 0;
  const debugClient = new ApiClient({gateway:'http://measurement.invalid', withoutExtensions:true,
    customerFetcher: async () => ({status:200,error:false,data:{ok:true}})});
  debugClient.setRuntimeDebugEnabled(true);
  debugClient.onDebugRequest(() => {debugNotifications++;});
  for (let i=0;i<300;i++) await debugClient.request('/debug', {publicRequest:true});
  const debugRecords = debugClient.getDebugRequests();
  assert.equal(debugRecords.length, 200);
  assert.equal(debugRecords[0].id, 100);
  assert.equal(debugRecords[199].id, 299);
  assert.equal(debugNotifications, 300);
  debugClient.dispose();
  const registrationCount = registryHistoryCount();
  for (let i=0; i<1000; i++) {
    emitter.emit('plugin-project-export', {pluginId:'measurement',siteId:987,definition:{type:'canvas-api-export',value:i}});
  }
  assert.equal(registryHistoryCount(), registrationCount+1);
  emitter.emit('remove-plugin-project-export', {pluginId:'measurement',siteId:987,type:'canvas-api-export'});
  assert.equal(registryHistoryCount(), registrationCount);
  let fetchCount = 0;
  const failing = new ApiClient({gateway: 'http://measurement.invalid', withoutExtensions: true,
    customerFetcher: async () => {fetchCount++;return {status:502,error:true,data:{error:'Bad gateway'}};}});
  await assert.rejects(failing.request('/unavailable', {publicRequest:true}), /Bad gateway/);
  assert.equal(fetchCount, 1);
  let pollCount = 0;
  let clearedIntervals = 0;
  const clear = global.clearInterval;
  global.clearInterval = handle => {clearedIntervals++;clear(handle);};
  failing.getTask = async () => {pollCount++;throw new Error('poll failure');};
  try {
    await assert.rejects(failing.wrapTask(Promise.resolve({id:'measurement-task'}), () => {}, {interval:1}), /poll failure/);
    assert.equal(pollCount, 1);
    assert.equal(clearedIntervals, 1);
  } finally {
    global.clearInterval = clear;
  }
  failing.dispose();
  global.gc();
  const baseline = process.memoryUsage().heapUsed;
  const baselineHistory = registryHistoryCount();
  const baselineListeners = listeners();
  console.log(JSON.stringify({mode, total, node: process.version, architecture: process.arch, baselineHeapMiB: mib(baseline), baselineHistory, baselineListeners}));
  const batch = 1000;
  let lastCreationMs = 0;
  for (let start = 0; start < total; start += batch) {
    const times = [];
    const batchStart = performance.now();
    for (let i = start; i < Math.min(start + batch, total); i++) {
      const t = performance.now();
      api = new ApiClient({gateway: 'http://measurement.invalid', asUser: {siteId: 1, userId: 1}});
      api.dispose();
      api = null;
      times.push(performance.now() - t);
    }
    const batchMs = performance.now() - batchStart;
    lastCreationMs = batchMs / times.length;
    times.sort((a,b) => a-b);
    global.gc();
    console.log(JSON.stringify({clients: Math.min(start + batch, total), history: registryHistoryCount(), exportListeners: emitter.all.get('project-export').length, heapGrowthMiB: mib(process.memoryUsage().heapUsed-baseline), rssMiB: mib(process.memoryUsage().rss), creationMeanMs: round(lastCreationMs), creationP95Ms: round(times[Math.floor(times.length*0.95)]), batchBlockedEventLoopMs: round(batchMs)}));
  }
  let timer;
  const started = performance.now();
  const delay = new Promise(resolve => {timer = setTimeout(() => resolve(performance.now()-started), 0);});
  for (let i=0;i<100;i++) {
    api = new ApiClient({gateway:'http://measurement.invalid'}); api.dispose(); api=null;
  }
  console.log(JSON.stringify({burstClients:100, timerDelayMs:round(await delay), finalListeners:listeners()}));
  assert.equal(registryHistoryCount(), baselineHistory);
  assert.deepEqual(listeners(), baselineListeners);
  fs.unlinkSync(outfile);
})().catch(err => { if(fs.existsSync(outfile)) fs.unlinkSync(outfile); console.error(err);process.exitCode=1; });
