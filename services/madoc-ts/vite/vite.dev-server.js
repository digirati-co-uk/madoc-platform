import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  clearScreen: false,
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  build: {
    manifest: true,
    target: ['es2021', 'chrome97', 'safari13'],
    minify: false,
    sourcemap: true,
  },
  server: {
    open: false,
    port: 3088,
    strictPort: true,
    force: true,
    hmr: {
      port: 3089,
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
