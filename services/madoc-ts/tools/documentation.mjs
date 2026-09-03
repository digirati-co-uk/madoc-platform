#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium, request as playwrightRequest } from 'playwright';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
try {
  process.loadEnvFile(path.join(projectRoot, '.env'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const DEFAULT_BASE_URL = 'https://madoc.local';
const DEFAULT_SITE = 'default';
const DEFAULT_OUTPUT = 'documentation/screenshots';

export function normaliseBaseUrl(value) {
  return value.replace(/\/+$/, '');
}

export function toInternationalString(value) {
  return typeof value === 'string' ? { en: [value] } : value;
}

export function resolveScreenshotPath(outputDirectory, name) {
  const outputRoot = path.resolve(outputDirectory);
  const file = path.resolve(outputRoot, name.endsWith('.png') ? name : `${name}.png`);
  if (file !== outputRoot && !file.startsWith(`${outputRoot}${path.sep}`)) {
    throw new Error(`Screenshot must stay inside ${outputRoot}`);
  }
  return file;
}

export function passwordResetUrl(verificationLink) {
  const link = new URL(verificationLink);
  link.pathname = link.pathname.replace(/\/activate-account$/, '/reset-password');
  return link;
}

export function parseArgs(argv) {
  const options = { scenario: '', headed: process.env.MADOC_HEADED === '1', help: false };
  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--headed') options.headed = true;
    else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
    else if (!options.scenario) options.scenario = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }
  return options;
}

class HttpError extends Error {
  constructor(method, url, status, body) {
    super(`${method} ${url} returned ${status}${body ? `: ${body}` : ''}`);
    this.status = status;
  }
}

async function readResponse(response, method, url) {
  const text = await response.text();
  if (!response.ok()) throw new HttpError(method, url, response.status(), text);
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function createApiContext(baseUrl, token) {
  const madocOrigin = new URL(baseUrl).origin;
  const context = await playwrightRequest.newContext({
    baseURL: baseUrl,
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: { authorization: `Bearer ${token}` },
  });

  const api = async (url, { method = 'GET', body, ...options } = {}) => {
    const target = new URL(url, baseUrl);
    if (target.origin !== madocOrigin) throw new Error(`API requests must stay on ${madocOrigin}`);
    const response = await context.fetch(target.href, {
      method,
      ...(typeof body === 'undefined' ? {} : { data: body }),
      ...options,
    });
    return readResponse(response, method, target.href);
  };

  return { api, close: () => context.dispose() };
}

async function exchangeApiKey(baseUrl, site, clientId, clientSecret) {
  const context = await playwrightRequest.newContext({ baseURL: baseUrl, ignoreHTTPSErrors: true });
  try {
    const url = `/s/${encodeURIComponent(site)}/auth/api-token`;
    const response = await context.post(url, { data: { client_id: clientId, client_secret: clientSecret } });
    const result = await readResponse(response, 'POST', url);
    if (!result?.token) throw new Error('Madoc did not return an API token');
    return result.token;
  } finally {
    await context.dispose();
  }
}

function createUrls(baseUrl, site) {
  const siteRoot = `${baseUrl}/s/${encodeURIComponent(site)}`;
  const absolute = value => {
    if (/^https?:\/\//.test(value)) return value;
    if (value.startsWith('/s/') || value.startsWith('/account/')) return `${baseUrl}${value}`;
    return `${siteRoot}${value.startsWith('/') ? value : `/${value}`}`;
  };
  return {
    site: absolute,
    admin: value => absolute(`/admin${value ? (value.startsWith('/') ? value : `/${value}`) : ''}`),
  };
}

async function activatePassword(verificationLink, password) {
  const link = passwordResetUrl(verificationLink);
  const context = await playwrightRequest.newContext({ ignoreHTTPSErrors: true });
  try {
    const response = await context.post(`${link.origin}${link.pathname}`, {
      form: {
        c1: link.searchParams.get('c1') || '',
        c2: link.searchParams.get('c2') || '',
        p1: password,
        p2: password,
      },
    });
    if (!response.ok()) {
      throw new HttpError('POST', link.pathname, response.status(), await response.text());
    }
  } finally {
    await context.dispose();
  }
}

async function waitForHydration(page) {
  await page.locator('#react-component.react-loaded').waitFor({ state: 'attached', timeout: 120_000 });
  await page.locator('body.dev-loading').waitFor({ state: 'detached', timeout: 120_000 });
}

async function createSession({ browser, baseUrl, site, outputDirectory, token, credentials, onClose }) {
  const urls = createUrls(baseUrl, site);
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    locale: 'en-GB',
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 1000 },
  });
  if (token) {
    await context.addCookies([{ name: `madoc/${site}`, value: token, url: baseUrl }]);
    await context.route(`${new URL(baseUrl).origin}/**`, route =>
      route.continue({
        headers: { ...route.request().headers(), authorization: `Bearer ${token}` },
      })
    );
  }
  if (credentials) {
    await context.request.post(urls.site('/login'), { form: credentials });
    const cookie = (await context.cookies()).find(item => item.name === `madoc/${site}`);
    if (!cookie) throw new Error(`Login failed for ${credentials.email}`);
    token = cookie.value;
  }

  const page = await context.newPage();
  const apiContext = await createApiContext(baseUrl, token);
  const navigate = async (url, options) => {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', ...options });
    await waitForHydration(page);
    return response;
  };
  const goto = (url, options = {}) => navigate(urls.site(url), options);
  const gotoAdmin = (url = '', options = {}) => navigate(urls.admin(url), options);
  const screenshot = async (name, options = {}) => {
    const file = resolveScreenshotPath(outputDirectory, name);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await waitForHydration(page);
    await page.evaluate(() => document.fonts?.ready);
    await page.screenshot({ path: file, animations: 'disabled', caret: 'hide', fullPage: true, ...options });
    console.log(path.relative(process.cwd(), file));
    return file;
  };
  const close = async () => {
    await apiContext.close();
    await context.close();
    onClose();
  };

  return { page, api: apiContext.api, goto, gotoAdmin, screenshot, close, urls };
}

async function createToolkit({ baseUrl, site, outputDirectory, clientId, clientSecret, headed }) {
  const token = await exchangeApiKey(baseUrl, site, clientId, clientSecret);
  const browser = await chromium.launch({ headless: !headed });
  const adminApi = await createApiContext(baseUrl, token);
  const sessions = new Set();
  const newSession = async options => {
    let session;
    session = await createSession({
      browser,
      baseUrl,
      site,
      outputDirectory,
      token: options?.credentials ? undefined : options?.token || token,
      credentials: options?.credentials,
      onClose: () => sessions.delete(session),
    });
    sessions.add(session);
    return session;
  };
  const admin = await newSession({ token });

  const waitForTask = async (taskId, { timeout = 120_000, interval = 1_000 } = {}) => {
    if (!taskId) throw new Error('A task id is required');
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const task = await adminApi.api(`/api/tasks/${taskId}?all=true`);
      if (task.status === 3) return task;
      if (task.status === -1) throw new Error(`Task ${taskId} failed: ${task.status_text || 'unknown error'}`);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error(`Task ${taskId} did not finish within ${timeout}ms`);
  };

  const importManifest = async (manifest, options = {}) => {
    if (!manifest) throw new Error('A IIIF manifest URL is required');
    const task = await adminApi.api('/api/madoc/iiif/import/manifest', {
      method: 'POST',
      body: { manifest },
    });
    return options.wait === false ? task : waitForTask(task.id, options);
  };

  const createProject = ({ label, summary = '', slug, ...project }) => {
    if (!label || !slug) throw new Error('Project label and slug are required');
    return adminApi.api('/api/madoc/projects', {
      method: 'POST',
      body: { ...project, slug, label: toInternationalString(label), summary: toInternationalString(summary) },
    });
  };

  const createUser = async ({ email, name, siteRole = 'viewer', role = 'researcher', password = randomUUID() }) => {
    if (!email || !name || !siteRole || !role || !password) throw new Error('User details cannot be blank');
    let user;
    let verificationLink;
    try {
      const created = await adminApi.api('/api/madoc/users', {
        method: 'POST',
        body: { email, name, role, skipEmail: true },
      });
      user = created;
      verificationLink = created.verificationLink;
    } catch (error) {
      if (error.status !== 409) throw error;
      const result = await adminApi.api(`/api/madoc/users?page=1&search=${encodeURIComponent(email)}&sort_by=id:desc`);
      user = result.users.find(item => item.email?.toLowerCase() === email.toLowerCase());
      if (!user) throw new Error(`User ${email} exists but could not be found`);
      await adminApi.api(`/api/madoc/users/${user.id}`, { method: 'PUT', body: { name, role } });
      const reset = await adminApi.api(`/api/madoc/users/${user.id}/reset-password`, {
        method: 'POST',
        body: { skipEmail: true },
      });
      verificationLink = reset.verificationLink;
    }
    await adminApi.api(`/api/madoc/manage-site/users/${user.id}/role`, {
      method: 'POST',
      body: { site_role: siteRole },
    });
    if (!verificationLink) throw new Error(`Madoc did not return a password link for ${email}`);
    await activatePassword(verificationLink, password);
    await adminApi.api(`/api/madoc/users/${user.id}/activate`, { method: 'POST' });
    return { ...user, name, role, siteRole, credentials: { email, password } };
  };

  const login = credentials => {
    if (!credentials?.email || !credentials?.password) throw new Error('Login email and password are required');
    return newSession({ credentials });
  };
  const close = async () => {
    await Promise.all([...sessions].map(session => session.close()));
    await adminApi.close();
    await browser.close();
  };

  return {
    admin,
    api: adminApi.api,
    baseUrl,
    site,
    createProject,
    createUser,
    importManifest,
    login,
    waitForTask,
    close,
  };
}

function printHelp() {
  console.log(`
Create Madoc documentation screenshots from a scenario.

Usage:
  pnpm docs:screenshot <scenario.mjs> [--headed]

Required environment:
  MADOC_CLIENT_ID
  MADOC_CLIENT_SECRET

Optional environment:
  MADOC_BASE_URL       ${DEFAULT_BASE_URL}
  MADOC_SITE           ${DEFAULT_SITE}
  MADOC_SCREENSHOT_DIR ${DEFAULT_OUTPUT}
  MADOC_HEADED         Set to 1 to show the browser
`);
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) return printHelp();
  if (!options.scenario) throw new Error('Pass a scenario file. Use --help for usage.');

  const clientId = process.env.MADOC_CLIENT_ID;
  const clientSecret = process.env.MADOC_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('MADOC_CLIENT_ID and MADOC_CLIENT_SECRET are required');

  const scenarioPath = path.resolve(options.scenario);
  const scenario = await import(pathToFileURL(scenarioPath).href);
  if (typeof scenario.default !== 'function') throw new Error(`${scenarioPath} must export a default function`);

  const toolkit = await createToolkit({
    baseUrl: normaliseBaseUrl(process.env.MADOC_BASE_URL || DEFAULT_BASE_URL),
    site: process.env.MADOC_SITE || DEFAULT_SITE,
    outputDirectory: process.env.MADOC_SCREENSHOT_DIR || DEFAULT_OUTPUT,
    clientId,
    clientSecret,
    headed: options.headed,
  });
  try {
    await scenario.default(toolkit);
  } finally {
    await toolkit.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
