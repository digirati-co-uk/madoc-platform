import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// This is the top level one for testing.
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: /^@\//, replacement: `${path.resolve(__dirname, 'src')}/` },
      { find: /^react$/, replacement: path.resolve(__dirname, 'node_modules/react') },
      { find: /^react-dom$/, replacement: path.resolve(__dirname, 'node_modules/react-dom') },
      {
        find: /^orderedmap$/,
        replacement: 'orderedmap/dist/index.cjs',
      },
    ],
  },
  optimizeDeps: {
    include: ['@manifest-editor/iiif-browser-bundle'],
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/'],
    },
  },
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
