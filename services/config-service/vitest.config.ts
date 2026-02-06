import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    env: {
      SCHEMAS_PATH: path.join(rootDir, 'configurator', 'schemas'),
      DEFAULT_CONFIG_PATH: path.join(rootDir, 'configurator', 'default_config'),
    },
  },
});
