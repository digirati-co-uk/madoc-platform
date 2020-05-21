/* eslint-disable @typescript-eslint/camelcase */
module.exports = {
  apps:
    process.env.NODE_ENV === 'production'
      ? [
          {
            name: 'server',
            script: 'lib/index.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env_production: {
              NODE_ENV: 'production',
            },
          },
          {
            name: 'queue',
            script: 'lib/queue/producer.js',
            instances: 8,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env_production: {
              NODE_ENV: 'production',
            },
          },
          {
            name: 'scheduler',
            script: 'lib/queue/scheduler.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env_production: {
              NODE_ENV: 'production',
            },
          },
        ]
      : [
          {
            name: 'server',
            script: 'lib/index.js',
            instances: 1,
            autorestart: true,
            watch: ['lib'],
            watch_options: {
              ignored: 'lib/frontend/admin/build/**',
            },
            max_memory_restart: '1G',
            env: {
              NODE_ENV: 'development',
            },
            env_production: {
              NODE_ENV: 'production',
            },
          },
          {
            name: 'queue',
            script: 'lib/queue/producer.js',
            instances: 1,
            autorestart: true,
            max_memory_restart: '1G',
            watch: ['lib/queue/producer.js'],
          },
          {
            name: 'scheduler',
            script: 'lib/queue/scheduler.js',
            instances: 1,
            autorestart: true,
            watch: ['lib/queue/scheduler.js'],
          },
        ],
};
