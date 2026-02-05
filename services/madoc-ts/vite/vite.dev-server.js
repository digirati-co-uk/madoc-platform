import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const PROSEMIRROR_PACKAGES = [
  ['prosemirror-model', 'dist/index.js'],
  ['prosemirror-state', 'dist/index.js'],
  ['prosemirror-view', 'dist/index.js'],
  ['prosemirror-transform', 'dist/index.js'],
];

function resolvePnpmModule(pkg, entry) {
  const pnpmPath = path.resolve(process.cwd(), 'node_modules/.pnpm');

  if (!fs.existsSync(pnpmPath)) {
    return null;
  }

  const matches = fs
    .readdirSync(pnpmPath)
    .filter(dir => dir === pkg || dir.startsWith(`${pkg}@`))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (!matches.length) {
    return null;
  }

  return path.join(pnpmPath, matches[matches.length - 1], 'node_modules', pkg, entry);
}

const prosemirrorAliases = PROSEMIRROR_PACKAGES.map(([pkg, entry]) => {
  const replacement = resolvePnpmModule(pkg, entry);
  if (!replacement) {
    return null;
  }

  return {
    find: new RegExp(`^${pkg}$`),
    replacement,
  };
}).filter(Boolean);

const https = fs.existsSync('/certs/local-key.pem') && fs.existsSync('/certs/local-cert.pem');

export default defineConfig({
  define: {
    global: {},
    process: {
      env: {
        NODE_DEBUG: false,
      },
    },
  },
  clearScreen: false,
  resolve: {
    dedupe: ['react', 'react-dom', ...PROSEMIRROR_PACKAGES.map(([pkg]) => pkg)],
    alias: [
      ...prosemirrorAliases,
      // React 19-compatible defaults.
    ],
  },
  build: {
    manifest: true,
    target: ['es2021', 'chrome97', 'safari13'],
    minify: false,
    sourcemap: true,
  },
  server: {
    https: https
      ? {
          key: fs.readFileSync('/certs/local-key.pem'),
          cert: fs.readFileSync('/certs/local-cert.pem'),
        }
      : false,
    cors: {
      origin: [/^https?:\/\/madoc\.local(?::\d+)?$/],
      credentials: true,
    },
    open: false,
    port: 3088,
    strictPort: true,
    force: true,
    hmr: {
      host: 'madoc.local',
      protocol: https ? 'wss' : 'ws',
      clientPort: 3088,
    },
  },
  envPrefix: ['VITE_'],
  plugins: [
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-styled-components',
            {
              displayName: true,
              fileName: false,
            },
          ],
        ],
      },
    }),
  ],
});
