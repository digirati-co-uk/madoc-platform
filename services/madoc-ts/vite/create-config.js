import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json').toString());

export const ENV = [
  'NODE_ENV',
  'NODE_DEBUG',
  'MIGRATE',
  'API_GATEWAY',
  'GATEWAY_HOST',
  'NODE_APP_INSTANCE',
  'MADOC_INSTALLATION_CODE',
  'COOKIE_KEYS',
  'SERVER_PORT',
  'REDIS_HOST',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GITHUB_CLIENT_CALLBACK_URL',
  'MADOC_ROOT_PATH',
  'STORAGE_FILE_DIRECTORY',
  'OMEKA_FILE_DIRECTORY',
  'THEME_DIR',
  'JWT_REQUEST_DIR',
  'JWT_RESPONSE_DIR',
  'MADOC_KEY_PATH',
  'DATABASE_HOST',
  'DATABASE_PORT',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'DATABASE_NAME',
  'DATABASE_SCHEMA',
  'DATABASE_SCHEMA',
  'POSTGRES_POOL_SIZE',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURITY',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'MAIL_FROM_USER',
  'CAPTURE_MODEL_API_MIGRATED',
];

// These are CJS modules
const TO_BUNDLE = [
  'jose',
  'sourcemapped-stacktrace',
  'react-dropzone',
  'styled-components',
  'immer',
  'koa-i18next-detector',
  'node-fetch',
  'react-accessible-dropdown-menu-hook',
  'react/jsx-runtime',
  'react-functional-select',
  'rich-markdown-editor',
  'react-iiif-vault',
  'react-dnd',
];

const DEDUPE = ['react', 'react-dom', 'styled-components', 'react-dnd', 'react-dnd-multi-backend'];
const SERVER_ALIASES = {
  // Avoid evaluating browser-only react-functional-select in server/worker bundles.
  'react-functional-select': '/src/frontend/shared/shims/react-functional-select.server.tsx',
  'react-functional-select/dist/Select': '/src/frontend/shared/shims/react-functional-select.server.tsx',
};

export function createConfig(name, entry) {
  return ({ command, mode }) => ({
    define: addEnvironmentVariables(ENV),
    clearScreen: false,
    resolve: {
      dedupe: DEDUPE,
      alias: {
        ...SERVER_ALIASES,
      },
    },
    build: {
      dedupe: DEDUPE,
      outDir: `dist/${name}`,
      lib: {
        formats: ['es'],
        fileName: format => `bundle.${format}.js`,
        entry,
      },
      manifest: true,
      target: ['node14'],
      minify: false,
      sourcemap: true,
      rollupOptions: {
        onwarn(warning, warn) {
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' &&
            typeof warning.message === 'string' &&
            warning.message.includes('"use client"')
          ) {
            return;
          }
          warn(warning);
        },
        external: [
          // Node + missing deps.
          'pm2',
          'fs',
          'path',
          'vm2',
          'crypto',
          'http',
          'https',
          'url',
          'stream',
          'whatwg-url',
          'zlib',
          'util',
          'debug',
          'csv-stringify',
          ...Object.keys(pkg.dependencies),
          ...Object.keys(pkg.devDependencies),
        ].filter(t => TO_BUNDLE.indexOf(t) === -1),
      },
      emptyOutDir: false,
      watch:
        mode === 'production'
          ? undefined
          : {
              awaitWriteFinish: {
                stabilityThreshold: 10000,
                pollInterval: 500,
              },
            },
    },
    plugins: [
      react({
        jsxRuntime: 'classic',
        jsxPure: true,
      }),
    ],
  });
}

function addEnvironmentVariables(variables) {
  const defined = {
    __SERVER__: JSON.stringify('true'),
  };
  for (const variable of variables) {
    defined[`process.env.${variable}`] = `process.env.${variable}`;
  }
  return defined;
}
