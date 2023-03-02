import react from '@vitejs/plugin-react';
import { defineConfig, splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  clearScreen: false,
  resolve: {
    alias: {
      'react-iiif-vault': 'react-iiif-vault/react17',
      'react-dom/client': 'react-dom',
    },
  },
  optimizeDeps: {
    exclude: ['react-dom/client'],
  },
  base: '/s/default/madoc/',
  build: {
    rollupOptions: {
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
