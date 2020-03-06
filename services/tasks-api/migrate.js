const { setupSlonikMigrator } = require('@slonik/migrator');
const { createPool } = require('slonik');
const nodeMon = require('nodemon');

const env = nodeMon.env ? nodeMon.env : process.env;

const slonik = createPool(
  `postgres://${env.DATABASE_USER}:${env.DATABASE_PASSWORD}@${env.DATABASE_HOST}:${env.DATABASE_PORT}/${env.DATABASE_NAME}`
);

const migrator = setupSlonikMigrator({
  migrationsPath: __dirname + '/migrations',
  slonik,
  mainModule: module,
});

module.exports = { slonik, migrator };
