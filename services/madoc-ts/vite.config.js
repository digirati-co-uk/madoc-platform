import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// This is the top level one for testing.
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
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
