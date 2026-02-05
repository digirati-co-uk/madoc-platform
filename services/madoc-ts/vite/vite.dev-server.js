import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

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
      // React 19-compatible defaults.
    },
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
