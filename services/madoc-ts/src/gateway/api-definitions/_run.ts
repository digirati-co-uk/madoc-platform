import { stringify } from 'query-string';
import { ApiClient } from '../api';
import { apiDefinitionIndex } from './_index';
import { ApiRequest } from './_meta';
import { validateApiRequest } from './_validate';
import { compile } from 'path-to-regexp';

export async function runApiRequest(
  api: ApiClient,
  request: ApiRequest<any, any>
): Promise<{ success: boolean; errors?: any[] }> {
  const definition = apiDefinitionIndex[request.id];
  if (!definition) {
    return { success: false, errors: ['Definition not found'] };
  }

  const result = validateApiRequest(definition, request);
  if (!result.valid) {
    return { success: false, errors: result.errors };
  }

  const toPathRegexp = compile(definition.url);
  const url = toPathRegexp(request.params);
  const fullUrl = request.query
    ? `${url}?${stringify(request.query, { arrayFormat: definition?.options?.queryArrayType })}`
    : url;

  try {
    await api.request(fullUrl, {
      method: definition.method,
      body: request.body || undefined,
    });
  } catch (e) {
    return {
      success: false,
      errors: [e.message],
    };
  }

  return {
    success: true,
    errors: [],
  };
}
