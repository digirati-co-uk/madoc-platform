const { setupSlonikMigrator } = require('@slonik/migrator');
const { createPool } = require('slonik');

const slonik =
  process.argv[2] === 'create'
    ? undefined
    : createPool(
        `postgres://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`
      );

const migrator = setupSlonikMigrator({
  migrationsPath: __dirname + '/migrations',
  slonik,
  mainModule: module,
  log: () => {
    // no-op
  },
});

module.exports = { slonik, migrator };
