/* eslint-disable @typescript-eslint/camelcase */
module.exports = {
  apps: [
    {
      name: "server",
      script: "entrypoint/server.cjs",
      instances: 1,
      instance_var: "NODE_APP_INSTANCE",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: process.env.NODE_ENV
      },
      env_production: {
        NODE_ENV: "production"
      }
    },
    {
      name: "queue",
      script: "entrypoint/producer.cjs",
      instances: 2,
      instance_var: "NODE_APP_INSTANCE",
      exec_mode: "cluster",
      autorestart: true,
      max_memory_restart: "300M",
      watch: false
    },
    {
      name: "scheduler",
      script: "entrypoint/scheduler.cjs",
      instances: 1,
      exec_mode: "cluster",
      instance_var: "NODE_APP_INSTANCE",
      autorestart: true,
      watch: false,
      max_memory_restart: "300M"
    },
    {
      name: "auth",
      script: "entrypoint/auth.cjs",
      max_memory_restart: "300M",
      instances: 1,
      exec_mode: "cluster",
      instance_var: "NODE_APP_INSTANCE",
      autorestart: true,
      watch: false
    }
  ]
};
