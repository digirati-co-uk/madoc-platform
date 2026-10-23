import { RequestError } from '../utility/errors/request-error';
import type NodeFetch from 'node-fetch';
import { createRequire } from 'module';

import { Readable } from 'stream';
import { lookup } from 'dns/promises';
import { BlockList, isIP } from 'net';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { JsonObject } from './types';
import { identifier, object } from './properties';
import { normalizePage, remoteTextBodies } from './annotation-document';

// Vite's browser shim ignores node-fetch's agent, timeout, and size limits.
const fetch: typeof NodeFetch = createRequire(`${process.cwd()}/package.json`)('node-fetch');

const blocked = new BlockList();
for (const [address, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['192.0.2.0', 24],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const)
  blocked.addSubnet(address, prefix, 'ipv4');
for (const [address, prefix] of [
  ['::', 96],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
  ['2001:db8::', 32],
  ['2001::', 32],
  ['2002::', 16],
] as const)
  blocked.addSubnet(address, prefix, 'ipv6');
blocked.addAddress('::1', 'ipv6');

export function validateRemoteUrl(input: string) {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new RequestError('Invalid annotation URL');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    (isIP(host) && blocked.check(host, isIP(host) === 6 ? 'ipv6' : 'ipv4'))
  ) {
    throw new RequestError('Annotation URLs must use HTTP(S) and a public address');
  }
  return url;
}

const MAX_BYTES = 10 * 1024 * 1024;

export async function fetchAnnotationResource(input: string, maxBytes = MAX_BYTES): Promise<string> {
  let url = validateRemoteUrl(input);
  for (let redirects = 0; redirects <= 5; redirects++) {
    const host = url.hostname.replace(/^\[|\]$/g, '');
    const addresses = await lookup(host, { all: true });
    if (
      !addresses.length ||
      addresses.some(address => blocked.check(address.address, address.family === 6 ? 'ipv6' : 'ipv4'))
    ) {
      throw new Error('Annotation URL resolves to a private or reserved address');
    }
    // Pin the validated address so DNS cannot change between validation and connection.
    const address = addresses[0];
    const options = {
      lookup: (
        _hostname: string,
        _options: unknown,
        callback: (error: Error | null, address: string, family: number) => void
      ) => callback(null, address.address, address.family),
      autoSelectFamily: false,
    };
    const agent = url.protocol === 'https:' ? new HttpsAgent(options) : new HttpAgent(options);
    try {
      const response = await fetch(url.href, { redirect: 'manual', timeout: 15000, size: maxBytes, agent });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        (response.body as Readable | null)?.destroy();
        if (!location) throw new Error('Annotation redirect has no location');
        url = validateRemoteUrl(new URL(location, url).href);
        continue;
      }
      if (!response.ok) {
        (response.body as Readable | null)?.destroy();
        throw new Error(`Annotation fetch failed (${response.status})`);
      }
      return await response.text();
    } finally {
      agent.destroy();
    }
  }
  throw new Error('Too many annotation redirects');
}

export async function loadAnnotationPages(
  url: string
): Promise<{ page: JsonObject; textBodies: Record<string, string>; textError?: string }> {
  const visited = new Set<string>();
  const pages: JsonObject[] = [];
  let next: string | undefined = url;
  let totalBytes = 0;
  while (next) {
    if (visited.has(next)) throw new Error('Annotation pagination contains a cycle');
    if (pages.length >= 50) throw new Error('Annotation pagination exceeds 50 pages');
    visited.add(next);
    const text = await fetchAnnotationResource(next);
    totalBytes += Buffer.byteLength(text);
    if (totalBytes > MAX_BYTES) throw new Error('Annotation pages exceed 10MB');
    const json: unknown = JSON.parse(text);
    if (!object(json)) throw new Error('Invalid annotation JSON');
    // Some providers omit items on empty pages. Only apply this after fetching:
    // references in the source manifest still need to be dereferenced first.
    const page = normalizePage(
      json.type === 'AnnotationPage' && json.items === undefined ? { ...json, items: [] } : json,
      next
    );
    pages.push(page);
    next = identifier(json.next);
    if (next) next = new URL(next, [...visited].pop()).href;
  }
  const document: JsonObject = { ...pages[0], items: pages.flatMap(page => page.items as JsonObject[]) };
  delete document.next;
  return { page: document, ...(await loadTextBodies(document, url, totalBytes)) };
}

export async function loadTextBodies(
  document: JsonObject,
  url: string,
  totalBytes = 0
): Promise<{ textBodies: Record<string, string>; textError?: string }> {
  const texts: Record<string, string> = Object.create(null);
  const started = Date.now();
  const attempted = new Set<string>();
  let textError: string | undefined;
  // Keep derived text separate from the original annotation body representation.
  for (const body of remoteTextBodies(document)) {
    const bodyUrl = identifier(body)!;
    if (attempted.has(bodyUrl)) continue;
    if (attempted.size >= 100 || Date.now() - started > 120000) {
      textError = 'Annotation text fetch limit exceeded';
      break;
    }
    attempted.add(bodyUrl);
    try {
      const text = await fetchAnnotationResource(new URL(bodyUrl, url).href);
      totalBytes += Buffer.byteLength(text);
      if (totalBytes > MAX_BYTES) {
        textError = 'Annotation text exceeds 10MB';
        break;
      }
      texts[bodyUrl] = text;
    } catch (error) {
      textError = error instanceof Error ? error.message : String(error);
    }
  }
  return { textBodies: texts, ...(textError ? { textError } : {}) };
}
