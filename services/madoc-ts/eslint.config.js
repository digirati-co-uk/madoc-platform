import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const legacyConfig = require('./.eslintrc.cjs');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [...compat.config(legacyConfig)];
