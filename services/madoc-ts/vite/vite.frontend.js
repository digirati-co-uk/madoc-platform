import react from '@vitejs/plugin-react';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
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

export default defineConfig({
  clearScreen: false,
  resolve: {
    dedupe: [...PROSEMIRROR_PACKAGES.map(([pkg]) => pkg)],
    alias: [
      ...prosemirrorAliases,
      // React 19-compatible defaults.
    ],
  },
  base: '/s/default/madoc/',
  build: {
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
      input: {
        site: 'src/site.html',
        admin: 'src/admin.html',
      },
      external: ['csv-stringify'],
    },
    outDir: `dist/frontend-site`,
    manifest: true,
    target: ['es2021', 'chrome97', 'safari13'],
    minify: 'esbuild',
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [
    splitVendorChunkPlugin(),
    react({
      jsxRuntime: 'classic',
      jsxPure: true,
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
