import { setupSlonikMigrator } from '@slonik/migrator';
import { createPool } from 'slonik';
import { join } from 'path';
import { ROOT_PATH } from './paths';

export async function migrate() {
  const slonik = createPool(
    `postgres://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`
  );

  const migrator = setupSlonikMigrator({
    migrationsPath: join(ROOT_PATH, '/migrations'),
    slonik,
    log: () => {
      // no-op
    },
  });

  return migrator.up() as any;
}
