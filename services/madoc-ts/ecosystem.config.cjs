/* eslint-disable @typescript-eslint/no-require-imports */
const os = require('os');

const cpuCount = os.availableParallelism();

function parsePm2Instances(value, fallback) {
  if (!value) {
    return fallback;
  }

  if (value === 'max') {
    return 'max';
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return fallback;
}

function parseMemory(value, fallback) {
  if (!value) {
    return fallback;
  }

  const valid = /^\d+(K|M|G)$/i.test(value.trim());
  return valid ? value : fallback;
}

const serverInstances = parsePm2Instances(process.env.PM2_SERVER_INSTANCES, Math.min(4, Math.max(2, cpuCount)));
const queueInstances = parsePm2Instances(process.env.PM2_QUEUE_INSTANCES, 2);
const schedulerInstances = parsePm2Instances(process.env.PM2_SCHEDULER_INSTANCES, 1);
const authInstances = parsePm2Instances(process.env.PM2_AUTH_INSTANCES, 1);

const serverMemory = parseMemory(process.env.PM2_SERVER_MAX_MEMORY, '768M');
const queueMemory = parseMemory(process.env.PM2_QUEUE_MAX_MEMORY, '512M');
const schedulerMemory = parseMemory(process.env.PM2_SCHEDULER_MAX_MEMORY, '256M');
const authMemory = parseMemory(process.env.PM2_AUTH_MAX_MEMORY, '256M');

module.exports = {
  apps: [
    {
      name: 'server',
      script: 'entrypoint/server.cjs',
      instances: serverInstances,
      instance_var: 'NODE_APP_INSTANCE',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: serverMemory,
      wait_ready: true,
      listen_timeout: 60000,
      kill_timeout: 120000,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        POSTGRES_POOL_SIZE: process.env.POSTGRES_POOL_SIZE || '10',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'queue',
      script: 'entrypoint/producer.cjs',
      instances: queueInstances,
      instance_var: 'NODE_APP_INSTANCE',
      exec_mode: 'cluster',
      autorestart: true,
      max_memory_restart: queueMemory,
      watch: false,
    },
    {
      name: 'scheduler',
      script: 'entrypoint/scheduler.cjs',
      instances: schedulerInstances,
      exec_mode: 'cluster',
      instance_var: 'NODE_APP_INSTANCE',
      autorestart: true,
      watch: false,
      max_memory_restart: schedulerMemory,
    },
    {
      name: 'auth',
      script: 'entrypoint/auth.cjs',
      max_memory_restart: authMemory,
      instances: authInstances,
      exec_mode: 'cluster',
      instance_var: 'NODE_APP_INSTANCE',
      autorestart: true,
      watch: false,
    },
  ],
};
