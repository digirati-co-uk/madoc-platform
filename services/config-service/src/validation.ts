import { promises as fs } from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv/dist/ajv.js';
import type { ErrorObject } from 'ajv';

import { appConfig } from './config.js';

const AjvClass = Ajv as unknown as new (options?: Record<string, unknown>) => {
  compile: (schema: object) => {
    (value: unknown): boolean;
    errors?: ErrorObject[] | null;
  };
};

const ajv = new AjvClass({ allErrors: true, strict: false });

export type ValidationResult = {
  valid: boolean;
  err: string | null;
};

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors || errors.length === 0) {
    return 'Schema validation failed';
  }
  return errors
    .map(error => {
      const pointer = error.instancePath || '/';
      return `${pointer} ${error.message ?? 'is invalid'}`.trim();
    })
    .join('; ');
}

async function loadSchema(serviceName: string): Promise<unknown> {
  const schemaPath = path.join(appConfig.schemasPath, `${serviceName}.json`);

  try {
    const data = await fs.readFile(schemaPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function validateDataFile(jsonObject: unknown, serviceName = 'config_base'): Promise<ValidationResult> {
  try {
    const schema = await loadSchema(serviceName);
    const validate = ajv.compile(schema as object);
    const valid = validate(jsonObject);

    if (!valid) {
      return {
        valid: false,
        err: formatErrors(validate.errors),
      };
    }

    return {
      valid: true,
      err: null,
    };
  } catch (error) {
    return {
      valid: false,
      err: error instanceof Error ? error.message : 'Schema validation failed',
    };
  }
}
