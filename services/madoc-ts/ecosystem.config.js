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
        ]
      : [
          {
            name: 'server',
            script: 'src/index.ts',
            instances: 1,
            autorestart: true,
            watch: true,
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
            script: 'src/queue/producer.ts',
            instances: 2,
            autorestart: true,
            watch: true,
          },
        ],
};
