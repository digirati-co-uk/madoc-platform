import Ajv from 'ajv';
import { ApiDefinition, ApiRequest } from './_meta';

const ajv = new Ajv();

export function validateApiRequest(
  definition: ApiDefinition,
  request: ApiRequest<any, any>
): { valid: true } | { valid: false; errors: any[] } {
  if (request.id !== definition.id) {
    return {
      valid: false,
      errors: ['Wrong identifier'],
    };
  }

  if (definition.params) {
    const validateParams = ajv.compile(definition.params);
    if (!validateParams(request.params)) {
      return {
        valid: false,
        errors: validateParams.errors?.map(error => `params/${error.dataPath} ${error.message}`) || ['Invalid params'],
      };
    }
  } else if (request.params && Object.keys(request.params).length) {
    return {
      valid: false,
      errors: ['No params defined for this definition'],
    };
  }

  if (definition.body) {
    const validateBody = ajv.compile(definition.body);
    if (!validateBody(request.body)) {
      return {
        valid: false,
        errors: validateBody.errors?.map(error => `body/${error.dataPath} ${error.message}`) || ['Invalid body'],
      };
    }
  } else if (request.body && Object.keys(request.body).length) {
    return {
      valid: false,
      errors: ['No body defined for this definition'],
    };
  }

  if (definition.query) {
    const validateQuery = ajv.compile(definition.query);
    if (!validateQuery(request.query)) {
      return {
        valid: false,
        errors: validateQuery.errors?.map(error => `query/${error.dataPath} ${error.message}`) || ['Invalid query'],
      };
    }
  } else if (request.query && Object.keys(request.query).length) {
    return {
      valid: false,
      errors: ['No query defined for this definition'],
    };
  }

  return {
    valid: true,
  };
}
