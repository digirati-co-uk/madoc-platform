import fetch from 'cross-fetch';

export async function fetchJson<Return>(
  apiGateway: string,
  endpoint: string,
  {
    method = 'GET',
    body,
    jwt,
    asUser,
  }: {
    method?: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
    body?: any;
    jwt?: string;
    asUser?: { userId?: number; siteId?: number };
  }
): Promise<{ error: true; data: { error: string }; status: number } | { error: false; data: Return; status: number }> {
  const headers: any = {
    Accept: 'application/json',
  };

  if (jwt) {
    headers.Authorization = `Bearer ${jwt}`;
  }

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  if (asUser) {
    if (asUser.userId) {
      headers['x-madoc-user-id'] = `${asUser.userId}`;
    }
    if (asUser.siteId) {
      headers['x-madoc-site-id'] = `${asUser.siteId}`;
    }
  }

  const resp = await fetch(`${apiGateway}${endpoint}`, {
    headers,
    method,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'omit',
  });

  if (resp.ok) {
    if (!resp.body) {
      return {
        error: false,
        status: resp.status,
        data: undefined as any,
      };
    }

    try {
      return {
        error: false,
        status: resp.status,
        data: await resp.json(),
      };
    } catch (err) {
      return {
        error: true,
        status: 500,
        data: { error: 'Unknown error' },
      };
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
  };
}
