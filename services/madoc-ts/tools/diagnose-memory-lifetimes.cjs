// Run: node --expose-gc services/madoc-ts/tools/diagnose-memory-lifetimes.cjs
// Executes actual TypeScript constructors/middleware/cache code with stubbed I/O.
// Synthetic payload sizes measure retention, not production request memory.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const packageRequire = createRequire(path.resolve(__dirname, '../package.json'));
const ts = packageRequire('typescript');

function load(relativePath, overrides = {}, expose = '') {
  const filename = path.resolve(__dirname, '../src', relativePath);
  const source = fs.readFileSync(filename, 'utf8') + '\n' + expose;
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  const localRequire = createRequire(filename);
  vm.runInNewContext(js, {
    module, exports: module.exports, console, AbortController, AbortSignal,
    require: id => Object.hasOwn(overrides, id) ? overrides[id] : localRequire(id),
  }, { filename });
  return module.exports;
}

function heapMiB() {
  global.gc?.();
  return process.memoryUsage().heapUsed / 1024 / 1024;
}

async function main() {
  const registry = load('extensions/registry-extension.ts');
  const manager = load('extensions/extension-manager.ts');
  const overrides = { '../registry-extension': registry, '../extension-manager': manager };
  const { ThemeExtension } = load('extensions/themes/extension.ts', overrides);
  const { PageBlockExtension } = load('extensions/page-blocks/extension.ts', overrides);
  const emitter = registry.RegistryExtension.emitter;
  const baseline = heapMiB();
  for (let n = 1; n <= 5000; n++) {
    // Same ownership pattern as SSR: API -> extension -> global registry listener.
    const api = { requestContext: Array.from({ length: 1024 }, (_, index) => index + n) };
    api.themes = new ThemeExtension(api);
    api.pageBlocks = new PageBlockExtension(api, []);
    if (n % 1000 === 0) {
      const listeners = ['themes', 'plugin-themes', 'remove-plugin-themes', 'block', 'plugin-block', 'remove-plugin-block']
        .reduce((sum, key) => sum + (emitter.all.get(key)?.length || 0), 0);
      assert.equal(listeners, n * 6);
      console.log(JSON.stringify({ candidate: 'undisposed SSR registries', syntheticApis: n, listeners,
        retainedHeapMiB: +(heapMiB() - baseline).toFixed(2) }));
    }
  }
  // Verify normal disposal prevents any additional registered listeners.
  const themeCount = emitter.all.get('themes').length;
  for (let n = 0; n < 1000; n++) {
    const theme = new ThemeExtension({});
    theme.dispose();
  }
  assert.equal(emitter.all.get('themes').length, themeCount);

  const { disposeApis } = load('middleware/dispose-apis.ts');
  let disposed = 0;
  const context = { disposableApis: [{ dispose() { disposed++; } }] };
  await assert.rejects(disposeApis(context, async () => { throw new Error('route failed'); }));
  assert.equal(disposed, 1);
  context.disposableApis.push({ dispose() { disposed++; } });
  await disposeApis(context, async () => {});
  assert.equal(disposed, 2);
  console.log(JSON.stringify({ candidate: 'disposeApis exception path', disposedAfterFailure: 1, disposedAfterSuccess: disposed }));

  let siteDisposed = 0;
  const { siteState } = load('middleware/site-state.ts', {
    '../gateway/api.server': { api: { asUser: () => ({ dispose: () => siteDisposed++ }) } },
    '../utility/cached-api-helper': { cachedApiHelper: () => () => {} },
  });
  const siteContext = { params: { slug: 'example' }, state: {}, siteManager: { getCachedSiteIdBySlug: async () => ({ id: 1 }) } };
  await assert.rejects(siteState(siteContext, async () => { throw new Error('route failed'); }));
  assert.equal(siteDisposed, 1);
  await siteState(siteContext, async () => {});
  assert.equal(siteDisposed, 2);
  console.log(JSON.stringify({ candidate: 'siteState exception path', disposedAfterFailure: 1, disposedAfterSuccess: siteDisposed }));

  const rendererPath = 'frontend/shared/utility/create-server-renderer.tsx';
  const rendererSource = ts.createSourceFile(rendererPath,
    fs.readFileSync(path.resolve(__dirname, '../src', rendererPath), 'utf8'), ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  const rendererOverrides = Object.fromEntries(rendererSource.statements
    .filter(ts.isImportDeclaration).map(statement => [statement.moduleSpecifier.text, {}]));
  let rendererDisposals = 0;
  let rendererCacheClears = 0;
  let stylesheetSeals = 0;
  Object.assign(rendererOverrides, {
    'react/jsx-runtime': {},
    'react-query': { makeQueryCache: () => ({ clear: () => rendererCacheClears++ }) },
    'react-query/hydration': { dehydrate: () => ({}) },
    'styled-components': { ServerStyleSheet: class { seal() { stylesheetSeals++; } } },
    '../../../gateway/api': { ApiClient: class { dispose() { rendererDisposals++; } } },
    '../../../gateway/internal-fetch-json': { createInternalAwareFetchJson: () => () => {} },
    'query-string': { parse: () => ({}) },
    'react-router': { matchRoutes: () => [] },
  });
  const { createServerRenderer } = load(rendererPath, rendererOverrides);
  const render = createServerRenderer(() => null, [], {}, 'http://example.test');
  const renderArgs = { url: '/missing', basename: '/', jwt: '', siteLocales: { localisations: [] } };
  assert.equal((await render(renderArgs)).type, 'redirect');
  await assert.rejects(render({ ...renderArgs, site: Promise.reject(new Error('site failed')) }));
  assert.equal(rendererDisposals, 2);
  assert.equal(rendererCacheClears, 2);
  assert.equal(stylesheetSeals, 2);
  console.log(JSON.stringify({ candidate: 'SSR redirect and error cleanup', rendererDisposals, rendererCacheClears, stylesheetSeals }));

  const { createInternalAwareFetchJson } = load('gateway/internal-fetch-json.ts', {
    './fetch-json': {},
    './internal-request-context': {},
    './internal-request': {},
    '../utility/cast-bool': {},
    '../utility/combine-abort-signals': load('utility/combine-abort-signals.ts'),
  });
  const controller = new AbortController();
  let notifyFetchStarted;
  const fetchStarted = new Promise(resolve => { notifyFetchStarted = resolve; });
  const cancellation = new Error('Prefetch cancelled by parent request');
  let receivedSignal;
  rendererOverrides['../../../gateway/internal-fetch-json'] = {
    createInternalAwareFetchJson: () => createInternalAwareFetchJson({
      isEnabled: () => false, getRunner: () => null, getCurrentContext: () => undefined, debug: () => false,
      networkFetcher: (_gateway, _endpoint, options) => new Promise((_resolve, reject) => {
        receivedSignal = options.signal;
        receivedSignal.addEventListener('abort', () => reject(cancellation), { once: true });
        notifyFetchStarted();
      }),
    }),
  };
  rendererOverrides['../../../gateway/api'] = { ApiClient: class {
    constructor(options) { this.options = options; }
    request(endpoint) { return this.options.customerFetcher('http://example.test', endpoint, { method: 'GET' }); }
    dispose() { rendererDisposals++; }
  } };
  rendererOverrides['react-query'] = { makeQueryCache: () => ({
    prefetchQuery: (key, getter) => getter(key), clear: () => rendererCacheClears++,
  }) };
  rendererOverrides['react-router'] = { matchRoutes: () => [{
    params: {}, pathname: '/missing', route: { element: { type: {
      getKey: () => 'prefetch', getData: (_key, _vars, userApi) => userApi.request('/api/madoc/example'),
    } } },
  }] };
  const abortableRender = load(rendererPath, rendererOverrides).createServerRenderer(() => null, [], {}, 'http://example.test');
  const abortedRender = abortableRender({ ...renderArgs, signal: controller.signal });
  const rejectedRender = assert.rejects(abortedRender, error => error === cancellation);
  await fetchStarted;
  controller.abort();
  await rejectedRender;
  assert.equal(receivedSignal.aborted, true);
  assert.equal(rendererDisposals, 3);
  assert.equal(rendererCacheClears, 3);
  assert.equal(stylesheetSeals, 3);
  console.log(JSON.stringify({ candidate: 'SSR prefetch cancellation', abortReachedNetworkFetcher: receivedSignal.aborted,
    rendererDisposals, rendererCacheClears, stylesheetSeals }));

  const exportOverrides = {
    '../../../../utility/parse-model-target': {},
    '../../../../utility/parse-urn': {},
    '../../../../utility/cache-helper': load('utility/cache-helper.ts'),
    '../../server-export': { ExportFile: { json: model => model } },
    '@iiif/helpers': { getValue: label => label.en?.[0] },
    '../../../../frontend/shared/utility/tabular-cell-flags': {},
    './tabular-export-order': {},
    '../project/tabular-export-order': { getTabularFieldOrderMap: () => new Map([['column', 0]]) },
  };
  const csv = load('extensions/project-export/export-configs/project/project-cvs-contributions-export.ts', exportOverrides,
    'exports.diagnosticFetchTargets = fetchTargets;');
  let targetRequests = 0;
  const targetApi = {
    getManifestById: async id => { targetRequests++; return { manifest: { label: { en: ['Manifest ' + id] }, source: 'https://example.test/manifest/' + id } }; },
    getCanvasById: async id => { targetRequests++; return { canvas: { label: { en: ['Canvas ' + id] }, source_id: 'https://example.test/canvas/' + id } }; },
  };
  const ids = Array.from({ length: 10000 }, (_, index) => index + 1);
  const firstTargets = await csv.diagnosticFetchTargets(targetApi, ids, ids);
  const secondTargets = await csv.diagnosticFetchTargets(targetApi, ids, ids);
  assert.equal(targetRequests, 40000);
  assert.notEqual(firstTargets.canvases, secondTargets.canvases);
  assert.equal(Object.keys(secondTargets.canvases).length, ids.length);
  console.log(JSON.stringify({ candidate: 'CSV target cache scoped to each export', manifests: 10000, canvases: 10000,
    fetchesAcrossTwoRuns: targetRequests }));

  const canvas = load('extensions/project-export/export-configs/canvas/canvas-model-export.ts', exportOverrides);
  let projectRequests = 0;
  const options = { config: {}, context: { type: 'project', id: 1 }, api: {
    getSiteCanvasPublishedModels: async () => ({ models: [{}] }),
    getProject: async () => { projectRequests++; return { template_config: {} }; },
  } };
  for (const id of Array.from({ length: 1000 }, (_, index) => index + 1)) {
    options.context.id = id;
    await canvas.canvasModelExport.exportData({ id: 1 }, options);
  }
  await canvas.canvasModelExport.exportData({ id: 1 }, options);
  const cache = packageRequire('memory-cache');
  assert.ok(cache.get('canvas-model-field-order:1000'));
  assert.equal(projectRequests, 1000);
  console.log(JSON.stringify({ candidate: 'project field-order cache with TTL', cachedProjects: 1000, fetchesAcross1001Exports: projectRequests }));
  cache.clear();
}

main().catch(error => { console.error(error); process.exitCode = 1; });
