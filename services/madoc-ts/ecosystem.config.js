/* eslint-disable @typescript-eslint/camelcase */
module.exports = {
  apps:
    process.env.NODE_ENV === 'production'
      ? [
          {
            name: 'server',
            script: 'lib/server.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '300M',
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
            max_memory_restart: '300M',
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
            max_memory_restart: '300M',
            env_production: {
              NODE_ENV: 'production',
            },
          },
          {
            name: 'auth',
            script: 'lib/auth-server.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '300M',
            env_production: {
              NODE_ENV: 'production',
            },
          },
        ]
      : [
          {
            name: 'server',
            script: 'lib/server.js',
            instances: 1,
            autorestart: true,
            watch: ['lib'],
            watch_options: {
              ignored: ['frontend/admin/build/**'],
              awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100,
              },
            },
            node_args: '--expose-gc --inspect=0.0.0.0:9230',
            max_memory_restart: '300M',
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
            max_memory_restart: '300M',
            watch: ['lib/queue/producer.js'],
            watch_options: {
              ignored: 'frontend/admin/build/**',
              awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100,
              },
            },
          },
          {
            name: 'scheduler',
            script: 'lib/queue/scheduler.js',
            instances: 1,
            autorestart: true,
            watch: ['lib/queue/scheduler.js'],
            max_memory_restart: '300M',
            watch_options: {
              ignored: 'frontend/admin/build/**',
              awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100,
              },
            },
          },
          {
            name: 'auth',
            script: 'lib/auth-server.js',
            max_memory_restart: '300M',
            instances: 1,
            autorestart: true,
            watch: ['lib/auth-server.js'],
          },
        ],
};
