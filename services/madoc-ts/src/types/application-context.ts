import { i18n } from 'i18next';
import { PluginManager } from '../frontend/shared/plugins/plugin-manager';
import { MediaRepository } from '../repository/media-repository';
import { PageBlocksRepository } from '../repository/page-blocks-repository';
import { CronJobs } from '../utility/cron-jobs';
import { ExternalConfig } from './external-config';
import { router } from '../router';
import { Pool } from 'mysql';
import { DatabasePoolConnectionType } from 'slonik';
import { OmekaApi } from '../utility/omeka-api';
import { Ajv } from 'ajv';

export interface ApplicationContext {
  i18next: i18n;
  externalConfig: ExternalConfig;
  routes: typeof router;
  mysql: Pool;
  connection: DatabasePoolConnectionType;
  pageBlocks: PageBlocksRepository;
  media: MediaRepository;
  omeka: OmekaApi;
  pluginManager: PluginManager;
  cron: CronJobs;
  ajv: Ajv;
  omekaPage?: string | ((token: string) => Promise<string | undefined>) | ((token: string) => undefined | string);
  omekaMessages: Array<{ type: 'success' | 'error'; message: string }>;
  omekaMinimal?: boolean;
}
