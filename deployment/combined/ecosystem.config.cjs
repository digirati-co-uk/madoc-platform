const madoc = require('/home/node/app/ecosystem.config.cjs');
const dev = process.env.NODE_ENV === 'development';

const nodeService = (name, directory, port, env = {}) => ({
  name,
  cwd: `/opt/services/${directory}`,
  script: 'dist/server.js',
  interpreter: '/usr/local/bin/node16',
  exec_mode: 'fork',
  instances: 1,
  watch: dev ? ['dist'] : false,
  ignore_watch: ['node_modules'],
  env: { NODE_ENV: process.env.NODE_ENV, SERVER_PORT: String(port), ...env },
});

madoc.apps.push(
  {
    name: 'redis', script: '/usr/bin/redis-server', interpreter: 'none', exec_mode: 'fork',
    args: '--bind 127.0.0.1 --dir /data/redis --appendonly yes --save 60 1',
  },
  {
    name: 'nginx', script: '/usr/sbin/nginx', interpreter: 'none', exec_mode: 'fork',
    args: '-g "daemon off;"',
  },
  nodeService('tasks-api', 'tasks-api', 3100, {
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_PORT: process.env.DATABASE_PORT,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_USER: process.env.POSTGRES_TASKS_API_USER,
    DATABASE_PASSWORD: process.env.POSTGRES_TASKS_API_PASSWORD,
    DATABASE_SCHEMA: process.env.POSTGRES_TASKS_API_SCHEMA,
    REDIS_HOST: '127.0.0.1',
    QUEUE_LIST: process.env.TASKS_QUEUE_LIST,
    MIGRATE: process.env.TASKS_MIGRATE || 'false',
  }),
  nodeService('storage-api', 'storage-api', 3101, {
    GATEWAY_HOST: process.env.GATEWAY_HOST,
  }),
  {
    name: 'config-service', cwd: '/opt/services/config-service', script: 'dist/index.js',
    exec_mode: 'fork', instances: 1, watch: dev ? ['dist'] : false,
    env: {
      NODE_ENV: process.env.NODE_ENV, PORT: '3102', HOST: '127.0.0.1',
      POSTGRES_HOST: process.env.DATABASE_HOST,
      POSTGRES_PORT: process.env.DATABASE_PORT,
      POSTGRES_DB: process.env.DATABASE_NAME,
      POSTGRES_USER: process.env.POSTGRES_CONFIG_SERVICE_USER,
      POSTGRES_PASSWORD: process.env.POSTGRES_CONFIG_SERVICE_PASSWORD,
      POSTGRES_SCHEMA: process.env.POSTGRES_CONFIG_SERVICE_SCHEMA,
      SCHEMAS_PATH: '/opt/services/config-service/configurator/schemas',
      DEFAULT_CONFIG_PATH: '/opt/services/config-service/configurator/default_config',
      MIGRATE: process.env.CONFIG_MIGRATE || 'false',
    },
  },
);

if (process.env.MADOC_STANDALONE === 'true') {
  madoc.apps.unshift(
    {
      name: 'postgres', script: '/usr/local/bin/postgres-entrypoint.sh', interpreter: 'none',
      exec_mode: 'fork', instances: 1, args: 'postgres',
    },
    {
      name: 'typesense', script: '/usr/local/bin/typesense-server', interpreter: 'none',
      exec_mode: 'fork', instances: 1,
      args: `--data-dir /data/typesense --api-key=${process.env.TYPESENSE_API_KEY || 'xyz'} --listen-address 127.0.0.1`,
    },
  );
}

if (dev) {
  madoc.apps.push(
    { name: 'vite', cwd: '/home/node/app', script: 'pnpm', interpreter: 'none', args: 'dev:vite', exec_mode: 'fork' },
    ...['producer', 'auth', 'server', 'scheduler'].map(bundle => ({
      name: `watch-${bundle}`, cwd: '/home/node/app', script: 'pnpm', interpreter: 'none',
      args: `watch:vite-${bundle}`, exec_mode: 'fork',
    })),
    { name: 'watch-tasks', cwd: '/opt/services/tasks-api', script: 'node_modules/.bin/esbuild', interpreter: 'none', args: 'src/index.ts --bundle --outfile=dist/server.js --platform=node --external:pg-native --external:pg/* --external:bullmq --watch', exec_mode: 'fork' },
    { name: 'watch-storage', cwd: '/opt/services/storage-api', script: 'node_modules/.bin/esbuild', interpreter: 'none', args: 'src/index.ts --bundle --outfile=dist/server.js --platform=node --external:sharp --watch', exec_mode: 'fork' },
    { name: 'watch-config', cwd: '/opt/services/config-service', script: 'pnpm', interpreter: 'none', args: 'exec tsc -p tsconfig.json --watch', exec_mode: 'fork' },
  );
}

module.exports = madoc;
