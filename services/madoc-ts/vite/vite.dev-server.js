import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import { resolve } from "path";

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
    dedupe: ['react', 'react-dom'],
    alias: {
      'react-iiif-vault': 'react-iiif-vault/react17',
      'react-dom/client': 'react-dom',
      '@/npm': resolve(__dirname, '../src/npm'),
    },
  },
  optimizeDeps: {
    exclude: ['react-dom/client'],
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
    open: false,
    port: 3088,
    strictPort: true,
    force: true,
    hmr: {
      protocol: https ? 'wss' : 'ws',
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
