import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json').toString());

export const ENV = [
  'NODE_ENV',
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
];

// These are CJS modules
const TO_BUNDLE = [
  'jose',
  'sourcemapped-stacktrace',
  'react-dropzone',
  // 'styled-components',
  'immer',
  'koa-i18next-detector',
  'node-fetch',
  'react-accessible-dropdown-menu-hook',
];

const DEDUPE = ['react', 'react-dom', 'styled-components'];

export function createConfig(name, entry) {
  return ({ command, mode }) => ({
    define: addEnvironmentVariables(ENV),
    clearScreen: false,
    resolve: {
      dedupe: DEDUPE,
      alias: {
        'react-iiif-vault': 'react-iiif-vault/react17',
        'react-dom/client': 'react-dom',
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
