import fetch from 'cross-fetch';

export async function fetchJson<Return>(
  apiGateway: string,
  endpoint: string,
  {
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
  }: {
    method?: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
    body?: any;
    jwt?: string;
    asUser?: { userId?: number; siteId?: number; userName?: string };
    xml?: boolean;
    plaintext?: boolean;
    returnText?: boolean;
    formData?: boolean;
    headers?: any;
    raw?: boolean;
  }
): Promise<
  | { error: true; data: { error: string }; status: number; debugResponse?: any }
  | { error: false; data: Return; status: number }
> {
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

  const resp = await fetch(`${apiGateway}${endpoint}`, {
    headers,
    method,
    body: body ? (xml || plaintext || formData ? body : JSON.stringify(body)) : undefined,
    credentials: 'omit',
  });

  if (resp.ok) {
    try {
      if (raw) {
        return {
          error: false,
          status: resp.status,
          data: resp as any,
        };
      }
      if (returnText) {
        return {
          error: false,
          status: resp.status,
          data: (await resp.text()) as any,
        };
      }

      return {
        error: false,
        status: resp.status,
        data: await resp.json(),
      };
    } catch (err) {
      if (resp.statusText === 'OK') {
        return {
          error: false,
          status: resp.status,
          data: undefined as any,
        };
      }
    }
  }

  try {
    const errorData = await resp.json();
    if (errorData.error) {
      return {
        error: true,
        status: resp.status,
        data: { error: errorData.error },
      };
    }
  } catch (e) {
    // fall through to the default unknown error.
  }

  return {
    error: true,
    status: resp.status,
    data: { error: 'Unknown error' },
    debugResponse: resp,
  };
}
