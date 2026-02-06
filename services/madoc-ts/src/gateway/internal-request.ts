import type Koa from 'koa';
import { Readable, Writable } from 'stream';

export interface InternalRequestParams {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: string | Buffer;
}

export interface InternalRequestResult {
  status: number;
  headers: Record<string, string | number | string[] | undefined>;
  body: Buffer;
}

export type InternalRequestRunner = (request: InternalRequestParams) => Promise<InternalRequestResult>;

let internalRequestRunner: InternalRequestRunner | null = null;

export function setInternalRequestRunner(runner: InternalRequestRunner | null) {
  internalRequestRunner = runner;
}

export function getInternalRequestRunner() {
  return internalRequestRunner;
}

class InternalReadableRequest extends Readable {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  socket: any;
  connection: any;
  httpVersionMajor = 1;
  httpVersionMinor = 1;
  httpVersion = '1.1';
  private readonly body?: Buffer;
  private sent = false;

  constructor({
    method,
    url,
    headers,
    body,
  }: {
    method: string;
    url: string;
    headers: Record<string, string | string[] | undefined>;
    body?: Buffer;
  }) {
    super();
    this.method = method;
    this.url = url;
    this.headers = headers;
    this.body = body;

    this.socket = {
      encrypted: false,
      remoteAddress: '127.0.0.1',
      setTimeout: () => this.socket,
      once: () => this.socket,
      on: () => this.socket,
      removeListener: () => this.socket,
    };
    this.connection = this.socket;
  }

  _read() {
    if (this.sent) {
      return;
    }

    this.sent = true;
    if (this.body) {
      this.push(this.body);
    }
    this.push(null);
  }
}

class InternalWritableResponse extends Writable {
  statusCode = 404;
  headersSent = false;
  private readonly headers: Record<string, string | number | string[] | undefined> = {};
  private readonly chunks: Buffer[] = [];

  setHeader(name: string, value: string | number | string[]) {
    this.headers[name.toLowerCase()] = value;
  }

  getHeader(name: string) {
    return this.headers[name.toLowerCase()];
  }

  getHeaders() {
    return { ...this.headers };
  }

  hasHeader(name: string) {
    return this.getHeader(name) !== undefined;
  }

  removeHeader(name: string) {
    delete this.headers[name.toLowerCase()];
  }

  writeHead(
    statusCode: number,
    statusMessageOrHeaders?: string | Record<string, string | number | string[]>,
    headers?: Record<string, string | number | string[]>
  ) {
    this.statusCode = statusCode;

    const headerMap =
      typeof statusMessageOrHeaders === 'string' ? headers : (statusMessageOrHeaders as Record<string, any>);

    if (headerMap) {
      for (const [key, value] of Object.entries(headerMap)) {
        this.setHeader(key, value);
      }
    }

    this.headersSent = true;
    return this;
  }

  flushHeaders() {
    this.headersSent = true;
  }

  _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    this.chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    this.headersSent = true;
    callback();
  }

  end(chunk?: any, encoding?: BufferEncoding | (() => void), callback?: () => void): this {
    this.headersSent = true;
    return super.end(chunk as any, encoding as any, callback as any);
  }

  getBody() {
    return this.chunks.length ? Buffer.concat(this.chunks) : Buffer.alloc(0);
  }
}

function normalizeHeaders(headers: Record<string, string> = {}) {
  const normalized: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}

export function createKoaInternalRequestRunner(app: Koa): InternalRequestRunner {
  const callback = app.callback();

  return async function runInternalRequest({ method, path, headers = {}, body }: InternalRequestParams) {
    const requestBody = body === undefined ? undefined : Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf-8');
    const normalizedHeaders = normalizeHeaders(headers);

    if (!normalizedHeaders.host) {
      normalizedHeaders.host = 'internal.madoc';
    }

    if (requestBody && !normalizedHeaders['content-length']) {
      normalizedHeaders['content-length'] = `${requestBody.byteLength}`;
    }

    const request = new InternalReadableRequest({
      method,
      url: path,
      headers: normalizedHeaders,
      body: requestBody,
    });
    const response = new InternalWritableResponse();

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };
      const fail = (error: Error) => {
        if (!settled) {
          settled = true;
          reject(error);
        }
      };

      response.once('finish', finish);
      response.once('error', fail);
      request.once('error', fail);

      Promise.resolve(callback(request as any, response as any)).catch(fail);
    });

    return {
      status: response.statusCode,
      headers: response.getHeaders(),
      body: response.getBody(),
    };
  };
}
