import { defineConfig } from 'vite';
import { createConfig } from './create-config.js';

export default defineConfig(createConfig('server', 'src/server.ts'));
