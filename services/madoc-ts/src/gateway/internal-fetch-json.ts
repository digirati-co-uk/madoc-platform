import type { Context } from 'koa';
import { castBool } from '../utility/cast-bool';
import { fetchJson } from './fetch-json';
import { getInternalRequestContext } from './internal-request-context';
import { getInternalRequestRunner, InternalRequestRunner } from './internal-request';

const SUBREQUEST_DEPTH_HEADER = 'x-madoc-subrequest-depth';
const DEFAULT_MAX_SUBREQUEST_DEPTH = 5;

type FetchJsonOptions = Parameters<typeof fetchJson>[2];

function parseDepth(value: string | string[] | undefined) {
  const depth = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(depth) && depth >= 0 ? depth : 0;
}

function toStringHeaders(headers: any = {}) {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined || value === null) {
      continue;
    }
    normalized[key.toLowerCase()] = Array.isArray(value) ? value.join(',') : `${value}`;
  }
  return normalized;
}

function getHeader(headers: Record<string, string>, name: string) {
  return headers[name.toLowerCase()];
}

function isLocalMadocPath(pathName: string) {
  return pathName === '/api/madoc' || pathName.startsWith('/api/madoc/') || pathName.startsWith('/s/');
}

function isLocalMadocEndpoint(endpoint: string) {
  const [pathName] = endpoint.split('?');
  return isLocalMadocPath(pathName);
}

function resolveMaxDepth(configured?: number) {
  if (typeof configured === 'number' && configured > 0) {
    return configured;
  }

  const envDepth = Number(process.env.MADOC_INTERNAL_SUBREQUESTS_MAX_DEPTH);
  if (Number.isFinite(envDepth) && envDepth > 0) {
    return envDepth;
  }

  return DEFAULT_MAX_SUBREQUEST_DEPTH;
}

function createDebugLogger(isEnabled: boolean) {
  if (!isEnabled) {
    return () => undefined;
  }

  return (details: string) => {
    console.log(`[internal-subrequest] ${details}`);
  };
}

export function createInternalAwareFetchJson({
  networkFetcher = fetchJson,
  getRunner = getInternalRequestRunner,
  getCurrentContext = getInternalRequestContext,
  isEnabled = () => castBool(process.env.MADOC_INTERNAL_SUBREQUESTS, false),
  maxDepth,
  debug = () => castBool(process.env.MADOC_INTERNAL_SUBREQUESTS_DEBUG, false),
}: {
  networkFetcher?: typeof fetchJson;
  getRunner?: () => InternalRequestRunner | null;
  getCurrentContext?: () => Context | undefined;
  isEnabled?: () => boolean;
  maxDepth?: number;
  debug?: () => boolean;
} = {}): typeof fetchJson {
  return async function internalAwareFetchJson<Return>(
    apiGateway: string,
    endpoint: string,
    requestOptions: FetchJsonOptions = {}
  ): Promise<
    | { error: true; data: { error: string }; status: number; debugResponse?: any }
    | { error: false; data: Return; status: number }
  > {
    const {
      method = 'GET',
      body,
      jwt,
      asUser,
      xml,
      plaintext,
      formData,
      returnText,
      headers: additionalHeaders = {},
      raw,
    } = requestOptions;

    const internalRoutingEnabled = isEnabled();
    const internalRunner = getRunner();

    // Current Madoc routes served by this process are `/api/madoc/*` and `/s/*`.
    // Prefixes such as `/api/tasks`, `/api/search`, `/api/storage`, and `/api/configurator`
    // are gateway/external services and should remain network requests.
    const shouldUseInternalRouting =
      internalRoutingEnabled &&
      !!internalRunner &&
      !formData &&
      !raw &&
      endpoint.startsWith('/') &&
      isLocalMadocEndpoint(endpoint);

    if (!shouldUseInternalRouting) {
      if (debug()) {
        const log = createDebugLogger(true);
        log(`mode=network method=${method} endpoint=${endpoint}`);
      }

      return networkFetcher(apiGateway, endpoint, requestOptions as any);
    }

    const headers: any = {
      Accept: 'application/json',
      ...additionalHeaders,
    };

    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    }

    if (!formData) {
      if (plaintext && body) {
        headers['Content-Type'] = 'text/plain';
      } else if (xml && body) {
        headers['Content-Type'] = 'text/xml';
      } else if (body) {
        headers['Content-Type'] = 'application/json';
      }
    }

    if (asUser) {
      if (asUser.userId) {
        headers['x-madoc-user-id'] = `${asUser.userId}`;
      }
      if (asUser.siteId) {
        headers['x-madoc-site-id'] = `${asUser.siteId}`;
      }
      if (asUser.userName) {
        headers['x-madoc-user-name'] = `${asUser.userName}`;
      }
    }

    const context = getCurrentContext();
    const normalizedHeaders = toStringHeaders(headers);

    const cookieHeader = context?.request?.headers?.cookie;
    if (!getHeader(normalizedHeaders, 'cookie') && cookieHeader) {
      normalizedHeaders.cookie = cookieHeader;
    }

    const currentDepth = parseDepth(
      getHeader(normalizedHeaders, SUBREQUEST_DEPTH_HEADER) ||
        (context?.request?.headers?.[SUBREQUEST_DEPTH_HEADER] as string | string[] | undefined)
    );
    const maxSubrequestDepth = resolveMaxDepth(maxDepth);

    if (currentDepth >= maxSubrequestDepth) {
      return {
        error: true,
        status: 508,
        data: {
          error: `Exceeded max sub-request depth (${maxSubrequestDepth})`,
        },
      };
    }

    const nextDepth = currentDepth + 1;
    normalizedHeaders[SUBREQUEST_DEPTH_HEADER] = `${nextDepth}`;

    if (debug()) {
      const log = createDebugLogger(true);
      log(`mode=internal depth=${nextDepth} method=${method} endpoint=${endpoint}`);
    }

    const internalBody = body ? (xml || plaintext ? (body as any) : JSON.stringify(body)) : undefined;
    const internalResponse = await internalRunner!({
      method,
      path: endpoint,
      headers: normalizedHeaders,
      body: internalBody,
    });
    const responseText = internalResponse.body.toString('utf-8');

    if (internalResponse.status >= 200 && internalResponse.status < 300) {
      try {
        if (returnText) {
          return {
            error: false,
            status: internalResponse.status,
            data: responseText as any,
          };
        }

        return {
          error: false,
          status: internalResponse.status,
          data: JSON.parse(responseText),
        };
      } catch (err) {
        if (internalResponse.status === 200) {
          return {
            error: false,
            status: internalResponse.status,
            data: undefined as any,
          };
        }
      }
    }

    try {
      const parsedError = responseText ? JSON.parse(responseText) : null;
      if (parsedError?.error) {
        return {
          error: true,
          status: internalResponse.status,
          data: { error: parsedError.error },
        };
      }
    } catch (e) {
      // fall through to unknown error.
    }

    return {
      error: true,
      status: internalResponse.status,
      data: { error: 'Unknown error' },
      debugResponse: {
        mode: 'internal',
        status: internalResponse.status,
      },
    };
  };
}
