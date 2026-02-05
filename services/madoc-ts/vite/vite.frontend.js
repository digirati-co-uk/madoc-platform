import react from '@vitejs/plugin-react';
import { defineConfig, splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  clearScreen: false,
  resolve: {
    alias: {
      // React 19-compatible defaults.
    },
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
