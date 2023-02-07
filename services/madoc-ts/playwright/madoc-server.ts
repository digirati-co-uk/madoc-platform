import { GenericContainer, Network, Wait } from 'testcontainers';
import { resolve, join } from 'path';
import { URL } from 'url';
import { promises } from 'fs';
import { createPool } from 'slonik';
import { setupSlonikMigrator } from '@slonik/migrator';

export async function createTestServer() {
  const __dirname = new URL('..', import.meta.url).pathname;

  const network = await new Network().start();

  const serverPort = 3000; // This is hard-coded in the nginx :(
  const authPort = 3001; // This is also hard-coded in the nginx :(
  const GATEWAY_HOST = `http://localhost:3002`; // Chicken and egg with container.

  process.env.GATEWAY_HOST = GATEWAY_HOST;
  process.env.MADOC_ROOT_PATH = resolve(__dirname);
  process.env.STORAGE_FILE_DIRECTORY = resolve(__dirname, '../../var/scratch');
  process.env.MADOC_KEY_PATH = resolve(__dirname, '../../var/scratch/openssl-certs');
  process.env.NODE_ENV = 'production';

  // Test Environment
  const POSTGRES_DB = 'postgres';
  const POSTGRES_PORT = 5432;
  const POSTGRES_USER = 'postgres';
  const POSTGRES_PASSWORD = 'postgres_password';

  const TASKS_QUEUE_LIST = 'tasks-api,madoc-ts';
  const MADOC_INSTALLATION_CODE = '$2b$14$eofdZp3nY.HyK68a9zCfoOs3fuphxHRAR/KhckFm.8Qi8sEmgMcCK';

  const POSTGRES_MADOC_TS_USER = 'madoc_ts';
  const POSTGRES_MADOC_TS_SCHEMA = 'madoc_ts';
  const POSTGRES_MADOC_TS_PASSWORD = 'madoc_ts_password';

  const POSTGRES_TASKS_API_USER = 'tasks_api';
  const POSTGRES_TASKS_API_SCHEMA = 'tasks_api';
  const POSTGRES_TASKS_API_PASSWORD = 'tasks_api_password';

  const POSTGRES_MODELS_API_USER = 'models_api';
  const POSTGRES_MODELS_API_SCHEMA = 'models_api';
  const POSTGRES_MODELS_API_PASSWORD = 'models_api_password';

  const POSTGRES_CONFIG_SERVICE_USER = 'config_service';
  const POSTGRES_CONFIG_SERVICE_SCHEMA = 'config_service';
  const POSTGRES_CONFIG_SERVICE_PASSWORD = 'config_service_password';

  const POSTGRES_SEARCH_API_USER = 'search_api';
  const POSTGRES_SEARCH_API_SCHEMA = 'search_api';
  const POSTGRES_SEARCH_API_PASSWORD = 'search_api_password';

  const gatewayRedis_ = new GenericContainer('redis:5-alpine')
    .withNetwork(network)
    .withNetworkAliases('gateway-redis')
    .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
    .start();

  const sharedPostgresImage = await GenericContainer.fromDockerfile(resolve(__dirname, '../shared-postgres'))
    .withCache(false)
    .build();

  const sharedPostgres_ = sharedPostgresImage
    .withNetwork(network)
    .withNetworkAliases('shared-postgres')
    .withExposedPorts(5432)
    .withEnvironment({
      POSTGRES_DB: `${POSTGRES_DB}`,
      POSTGRES_USER: `${POSTGRES_USER}`,
      POSTGRES_PASSWORD: `${POSTGRES_PASSWORD}`,
      PGUSER: 'postgres',
      POSTGRES_MADOC_TS_USER: `${POSTGRES_MADOC_TS_USER}`,
      POSTGRES_MADOC_TS_SCHEMA: `${POSTGRES_MADOC_TS_SCHEMA}`,
      POSTGRES_MADOC_TS_PASSWORD: `${POSTGRES_MADOC_TS_PASSWORD}`,
      POSTGRES_TASKS_API_USER: `${POSTGRES_TASKS_API_USER}`,
      POSTGRES_TASKS_API_SCHEMA: `${POSTGRES_TASKS_API_SCHEMA}`,
      POSTGRES_TASKS_API_PASSWORD: `${POSTGRES_TASKS_API_PASSWORD}`,
      POSTGRES_MODELS_API_USER: `${POSTGRES_MODELS_API_USER}`,
      POSTGRES_MODELS_API_SCHEMA: `${POSTGRES_MODELS_API_SCHEMA}`,
      POSTGRES_MODELS_API_PASSWORD: `${POSTGRES_MODELS_API_PASSWORD}`,
      POSTGRES_CONFIG_SERVICE_USER: `${POSTGRES_CONFIG_SERVICE_USER}`,
      POSTGRES_CONFIG_SERVICE_SCHEMA: `${POSTGRES_CONFIG_SERVICE_SCHEMA}`,
      POSTGRES_CONFIG_SERVICE_PASSWORD: `${POSTGRES_CONFIG_SERVICE_PASSWORD}`,
      POSTGRES_SEARCH_API_USER: `${POSTGRES_SEARCH_API_USER}`,
      POSTGRES_SEARCH_API_SCHEMA: `${POSTGRES_SEARCH_API_SCHEMA}`,
      POSTGRES_SEARCH_API_PASSWORD: `${POSTGRES_SEARCH_API_PASSWORD}`,
    })
    .withHealthCheck({
      test: ['CMD-SHELL', 'pg_isready -u postgres'],
      interval: 1000,
      timeout: 3000,
      retries: 5,
      startPeriod: 3000,
    })
    .start();

  const [gatewayRedis, sharedPostgres] = await Promise.all([gatewayRedis_, sharedPostgres_]);

  const tasksApi_ = new GenericContainer('ghcr.io/digirati-co-uk/tasks-api:latest')
    .withNetwork(network)
    .withNetworkAliases('tasks-api')
    .withEnvironment({
      SERVER_PORT: `3000`,
      DATABASE_HOST: `shared-postgres`,
      DATABASE_NAME: `${POSTGRES_DB}`,
      DATABASE_PORT: `${POSTGRES_PORT}`,
      DATABASE_USER: `${POSTGRES_TASKS_API_USER}`,
      DATABASE_SCHEMA: `${POSTGRES_TASKS_API_SCHEMA}`,
      DATABASE_PASSWORD: `${POSTGRES_TASKS_API_PASSWORD}`,
      QUEUE_LIST: `${TASKS_QUEUE_LIST}`,
      REDIS_HOST: `gateway-redis`,
    })
    .withStartupTimeout(10000)
    .withWaitStrategy(Wait.forLogMessage('Server ready at: http://localhost:3000'))
    .start();

  const configService_ = new GenericContainer(
    'digirati/madoc_config_service_django:175410fc5b7dbef4cc259686564fbedeb60c8789'
  )
    .withNetwork(network)
    .withNetworkAliases('config-service')
    .withEnvironment({
      USE_DOCKER: `yes`,
      IPYTHONDIR: `/app/.ipython`,
      MIGRATE: `True`,
      LOAD: `False`,
      DJANGO_DEBUG: `False`,
      WAITRESS: `False`,
      POSTGRES_HOST: `shared-postgres`,
      POSTGRES_PORT: `${POSTGRES_PORT}`,
      POSTGRES_USER: `${POSTGRES_CONFIG_SERVICE_USER}`,
      POSTGRES_PASSWORD: `${POSTGRES_CONFIG_SERVICE_PASSWORD}`,
      POSTGRES_SCHEMA: `${POSTGRES_CONFIG_SERVICE_SCHEMA}`,
      POSTGRES_DB: `${POSTGRES_DB}`,
      DATABASE_URL: `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@shared-postgres:${POSTGRES_PORT}/${POSTGRES_DB}`,
    })
    .withStartupTimeout(10000)
    .withWaitStrategy(Wait.forLogMessage('http://127.0.0.1:5000/'))
    .start();

  const storageApi_ = new GenericContainer('ghcr.io/digirati-co-uk/storage-api:main')
    .withNetwork(network)
    .withNetworkAliases('storage-api')
    .withEnvironment({
      GATEWAY_HOST: GATEWAY_HOST,
    })
    .withTmpFs({ '/home/node/app/files': 'rw,noexec,nosuid,size=65536k' })
    .start();

  const searchService_ = new GenericContainer(
    'ghcr.io/digirati-co-uk/madoc-search-service:247f854b1258e3971907e6912cef2374a1da8474'
  )
    .withNetwork(network)
    .withNetworkAliases('search')
    .withStartupTimeout(10000)
    .withEnvironment({
      BROWSABLE: `False`,
      USE_DOCKER: `yes`,
      IPYTHONDIR: `/app/.ipython`,
      MIGRATE: `True`,
      LOAD: `False`,
      DJANGO_DEBUG: `False`,
      WAITRESS: `False`,
      POSTGRES_HOST: `shared-postgres`,
      POSTGRES_PORT: `${POSTGRES_PORT}`,
      POSTGRES_USER: `${POSTGRES_SEARCH_API_USER}`,
      POSTGRES_PASSWORD: `${POSTGRES_SEARCH_API_PASSWORD}`,
      POSTGRES_SCHEMA: `${POSTGRES_SEARCH_API_SCHEMA}`,
      POSTGRES_DB: `${POSTGRES_DB}`,
      DATABASE_URL: `postgres://${POSTGRES_SEARCH_API_USER}:${POSTGRES_SEARCH_API_PASSWORD}@shared-postgres:${POSTGRES_PORT}/${POSTGRES_DB}`,
    })
    .withWaitStrategy(Wait.forLogMessage('http://127.0.0.1:5000/'))
    .start();

  const okra_ = new GenericContainer('digirati/okra:latest')
    .withNetwork(network)
    .withNetworkAliases('okra')
    // .withWaitStrategy(Wait.forLogMessage("Ready to accept connections"))
    .start();

  const [tasksApi, configService, storageApi, searchService, okra] = await Promise.all([
    tasksApi_,
    configService_,
    storageApi_,
    searchService_,
    okra_,
  ]);

  const config = await promises.readFile(join(__dirname, 'config.json')).then(r => JSON.parse(r.toString('utf-8')));

  /**
   * @type { (config: import("./src/types/external-config").ExternalConfig, env: import("./src/types/env-config").EnvConfig ) => void }
   */
  // @ts-ignore
  const createApp = (await import('../dist/app/bundle.es.js')).createApp;

  const pg = {
    host: sharedPostgres.getHost(),
    port: sharedPostgres.getMappedPort(5432),
    name: 'default',
    username: POSTGRES_MADOC_TS_USER,
    password: POSTGRES_MADOC_TS_PASSWORD,
    database: POSTGRES_DB,
    schema: POSTGRES_MADOC_TS_SCHEMA,
    synchronize: true,
    logging: true,
    postgres_pool_size: 100,
  };

  // Migrations...
  const slonik = createPool(`postgres://${pg.username}:${pg.password}@${pg.host}:${pg.port}/${pg.database}`);
  const migrator = setupSlonikMigrator({
    migrationsPath: join(process.env.MADOC_ROOT_PATH, '/migrations'),
    slonik,
    log: () => {
      // no-op
    },
  });

  await migrator.up();

  async function stop() {
    // Stop everything
    await Promise.all([
      sharedPostgres.stop(),
      gatewayRedis.stop(),
      tasksApi.stop(),
      configService.stop(),
      storageApi.stop(),
      searchService.stop(),
      okra.stop(),
    ]);
    await network.stop();
  }

  process.on('SIGINT', stop);

  const app = await createApp(config, {
    flags: {},
    postgres: pg,
    smtp: {},
  });

  const server = await app.listen(3000);

  // And finally the gateway.
  const gatewayImage = await GenericContainer.fromDockerfile(resolve(__dirname, '../gateway')).build();

  const gateway = await gatewayImage
    .withNetwork(network)
    .withExposedPorts({ container: 8080, host: 3002 })
    .withExtraHosts([
      {
        host: 'madoc-ts',
        ipAddress: 'host-gateway',
      },
    ])
    .withExtraHosts([
      {
        host: 'model-api', // to be removed...
        ipAddress: 'host-gateway',
      },
    ])
    .withWaitStrategy(Wait.forHttp('localhost', 3002))
    .start();

  // Now we are ready!

  return {
    app,
    server,
    sharedPostgres,
    gatewayRedis,
    tasksApi,
    configService,
    storageApi,
    searchService,
    okra,
    stop,
    slonik,
  };
}
