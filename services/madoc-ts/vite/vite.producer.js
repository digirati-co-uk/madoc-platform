import { defineConfig } from 'vite';
import { createConfig } from './create-config.js';

export default defineConfig(createConfig('producer', 'src/queue/producer.ts'));
