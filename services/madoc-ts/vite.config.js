import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pnpmStorePath = path.resolve(__dirname, 'node_modules/.pnpm');
const orderedMapCjsCandidates = [path.resolve(__dirname, 'node_modules/orderedmap/dist/index.cjs')];
if (fs.existsSync(pnpmStorePath)) {
  const orderedMapPackageDir = fs
    .readdirSync(pnpmStorePath)
    .filter(name => name.startsWith('orderedmap@'))
    .sort()
    .pop();
  if (orderedMapPackageDir) {
    orderedMapCjsCandidates.push(path.resolve(pnpmStorePath, orderedMapPackageDir, 'node_modules/orderedmap/dist/index.cjs'));
  }
}
const orderedMapCjsPath = orderedMapCjsCandidates.find(candidate => fs.existsSync(candidate)) ?? 'orderedmap';

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
        replacement: orderedMapCjsPath,
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
