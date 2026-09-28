import { DatabasePoolType } from 'slonik';
import { setupSlonikMigrator } from '@slonik/migrator';
import { AppConfig } from './types';

export async function migrate(config: AppConfig, slonik: DatabasePoolType) {
  if (!config.migrate) {
    return Promise.resolve();
  }
  const migrator = setupSlonikMigrator({
    migrationsPath: config.migrationsPath,
    slonik,
    mainModule: module,
  });

  return migrator.up() as any;
}
