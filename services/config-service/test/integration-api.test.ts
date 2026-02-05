import { randomUUID } from 'node:crypto';

import { beforeAll, describe, expect, it } from 'vitest';

import { createConfigApp } from '../src/app.js';
import { ConfigService } from '../src/configurator.js';
import { InMemoryConfigRepository } from './helpers/in-memory-repository.js';

function toBase64Url(json: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(json), 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function makeJwt(payload: Record<string, unknown>): string {
  const header = { typ: 'JWT', alg: 'none' };
  return `${toBase64Url(header)}.${toBase64Url(payload)}.`;
}

const madocAccessJwtHeaders = {
  Authorization: `Bearer ${makeJwt({ iss: 'urn:madoc:site:1' })}`,
};

const madocServiceJwtHeaders = {
  Authorization: `Bearer ${makeJwt({ service: true, iss: 'urn:madoc:gateway' })}`,
  'x-madoc-site-id': '1',
};

const configFixture = {
  service: 'OCR',
  config_context: ['fixture_manifest', 'collection1', 'urn:madoc:site:1', 'institution1', 'global'],
  config_data: { run: true, ocr_engine: 'Google Vision', language: 'Arabic' },
};

describe('integration api parity', () => {
  const app = createConfigApp(new ConfigService(new InMemoryConfigRepository()));
  let configInstance: Record<string, unknown>;
  let initialGetJson: Record<string, unknown>;
  let initialGetEtag: string;

  beforeAll(async () => {
    const response = await app.request('http://localhost/configurator/', {
      method: 'POST',
      headers: {
        ...madocAccessJwtHeaders,
        'content-type': 'application/json',
      },
      body: JSON.stringify(configFixture),
    });
    configInstance = await response.json();

    const identifier = String(configInstance.id);
    const initialGet = await app.request(`http://localhost/configurator/${identifier}/`, {
      headers: madocAccessJwtHeaders,
    });
    initialGetJson = await initialGet.json();
    initialGetEtag = (initialGet.headers.get('ETag') || '').replace(/^[Ww]\/?"(.*)"$/, '$1');
  });

  it('root get', async () => {
    const response = await app.request('http://localhost/configurator/');
    expect(response.status).toBe(200);
  });

  it('missing id', async () => {
    const identifier = randomUUID();
    const response = await app.request(`http://localhost/configurator/${identifier}/`);
    expect(response.status).toBe(404);
  });

  it('post single config', async () => {
    expect(configInstance).toBeTruthy();
    expect(configInstance.id).toBeTruthy();
  });

  it('get with access jwt headers', async () => {
    const identifier = String(configInstance.id);
    const response = await app.request(`http://localhost/configurator/${identifier}/`, {
      headers: madocAccessJwtHeaders,
    });
    expect(response.status).toBe(200);
  });

  it('get with service jwt headers', async () => {
    const identifier = String(configInstance.id);
    const response = await app.request(`http://localhost/configurator/${identifier}/`, {
      headers: madocServiceJwtHeaders,
    });
    expect(response.status).toBe(200);
  });

  it('get with no jwt headers', async () => {
    const identifier = String(configInstance.id);
    const response = await app.request(`http://localhost/configurator/${identifier}/`);
    expect(response.status).toBe(404);
  });

  it('post same config twice returns 409 with access headers', async () => {
    const response = await app.request('http://localhost/configurator/', {
      method: 'POST',
      headers: {
        ...madocAccessJwtHeaders,
        'content-type': 'application/json',
      },
      body: JSON.stringify(configFixture),
    });
    expect(response.status).toBe(409);
  });

  it('post same config twice returns 409 with service headers', async () => {
    const response = await app.request('http://localhost/configurator/', {
      method: 'POST',
      headers: {
        ...madocServiceJwtHeaders,
        'content-type': 'application/json',
      },
      body: JSON.stringify(configFixture),
    });
    expect(response.status).toBe(409);
  });

  it('post same config without headers returns 403', async () => {
    const response = await app.request('http://localhost/configurator/', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(configFixture),
    });
    expect(response.status).toBe(403);
  });

  it('restful get works', async () => {
    const identifier = String(configInstance.id);
    const response = await app.request(`http://localhost/configurator/${identifier}/`, {
      headers: madocAccessJwtHeaders,
    });
    expect(response.status).toBe(200);
  });

  it('config contents match original post', () => {
    const original = configInstance.config_object as Record<string, unknown>;
    for (const [key, value] of Object.entries(original)) {
      expect(initialGetJson[key]).toEqual(value);
    }
  });

  it('config version exists', () => {
    expect(initialGetJson.version_id).toBeTruthy();
  });

  it('config starts at version 1', () => {
    expect(initialGetJson.version_id).toBe(1);
  });

  it('etag exists', () => {
    expect(initialGetEtag).toBeTruthy();
  });

  it('put with no etag returns 400', async () => {
    const identifier = String(configInstance.id);
    const response = await app.request(`http://localhost/configurator/${identifier}/`, {
      method: 'PUT',
      headers: {
        ...madocAccessJwtHeaders,
        'content-type': 'application/json',
      },
      body: JSON.stringify(configInstance.config_object),
    });
    expect(response.status).toBe(400);
  });

  it('put with wrong etag returns 412', async () => {
    const identifier = String(configInstance.id);
    const response = await app.request(`http://localhost/configurator/${identifier}/`, {
      method: 'PUT',
      headers: {
        ...madocAccessJwtHeaders,
        'content-type': 'application/json',
        'if-match': 'foo',
      },
      body: JSON.stringify(configInstance.config_object),
    });
    expect(response.status).toBe(412);
  });

  it('put with correct etag returns 204 and increments version', async () => {
    const identifier = String(configInstance.id);
    const response = await app.request(`http://localhost/configurator/${identifier}/`, {
      method: 'PUT',
      headers: {
        ...madocAccessJwtHeaders,
        'content-type': 'application/json',
        'if-match': initialGetEtag,
      },
      body: JSON.stringify(configInstance.config_object),
    });
    expect(response.status).toBe(204);

    const newResponse = await app.request(`http://localhost/configurator/${identifier}/`, {
      headers: madocAccessJwtHeaders,
    });
    expect(newResponse.status).toBe(200);

    const newJson = await newResponse.json();
    expect(Number(newJson.version_id)).toBeGreaterThan(Number(initialGetJson.version_id));
  });

  it('get service status', async () => {
    const response = await app.request('http://localhost/configurator/query?service=OCR_TestFixture&context=global');
    expect(response.status).toBe(200);
  });

  it('get service config exists', async () => {
    const response = await app.request('http://localhost/configurator/query?service=OCR_TestFixture&context=global');
    const responseJson = await response.json();
    expect(responseJson.config).toBeTruthy();
  });

  it('get site service config exists', async () => {
    const response = await app.request('http://localhost/configurator/query?service=OCR_TestFixture&context=urn:madoc:site:1');
    const responseJson = await response.json();
    expect(responseJson.config).toBeTruthy();
  });

  it('service fallback payload matches', async () => {
    const response = await app.request('http://localhost/configurator/query?service=OCR_TestFixture&context=global');
    const responseJson = await response.json();
    expect(responseJson.config[0].service).toBe('OCR_TestFixture');
    expect(responseJson.config[0].config_object).toEqual({
      run: true,
      ocr_engine: 'Tesseract',
      language: 'English',
    });
  });

  it('missing service returns empty config list', async () => {
    const response = await app.request('http://localhost/configurator/query?service=NonExistingService&context=global');
    const responseJson = await response.json();
    expect(response.status).toBe(200);
    expect(responseJson.config).toEqual([]);
  });
});
