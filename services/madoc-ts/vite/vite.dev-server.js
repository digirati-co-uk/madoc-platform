import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

const https = fs.existsSync('/certs/local-key.pem') && fs.existsSync('/certs/local-cert.pem');

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
