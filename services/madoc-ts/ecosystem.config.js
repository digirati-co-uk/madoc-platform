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
            max_memory_restart: '2G',
            env_production: {
              NODE_ENV: 'production',
            },
          },
          {
            name: 'queue',
            script: 'lib/queue/producer.js',
            instances: 2,
            autorestart: true,
            watch: false,
            max_memory_restart: '2G',
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
            max_memory_restart: '2G',
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
              ignored: 'frontend/admin/build/**',
            },
            node_args: '--expose-gc --inspect=0.0.0.0:9229',
            max_memory_restart: '2G',
            env: {
              NODE_ENV: process.env.NODE_ENV,
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
            max_memory_restart: '2G',
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
