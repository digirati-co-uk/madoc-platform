import { i18n } from 'i18next';
import { PluginManager } from '../frontend/shared/plugins/plugin-manager';
import { ChangeDiscoveryRepository } from '../activity-streams/change-discovery-repository';
import { ApiClient } from '../gateway/api';
import { MediaRepository } from '../repository/media-repository';
import { NotificationRepository } from '../repository/notification-repository';
import { PageBlocksRepository } from '../repository/page-blocks-repository';
import { PluginRepository } from '../repository/plugin-repository';
import { SiteUserRepository } from '../repository/site-user-repository';
import { ThemeRepository } from '../repository/theme-repository';
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
  plugins: PluginRepository;
  themes: ThemeRepository;
  media: MediaRepository;
  notifications: NotificationRepository;
  changeDiscovery: ChangeDiscoveryRepository;
  omeka: OmekaApi;
  siteManager: SiteUserRepository;
  pluginManager: PluginManager;
  cron: CronJobs;
  ajv: Ajv;
  omekaPage?: string | ((token: string) => Promise<string | undefined>) | ((token: string) => undefined | string);
  omekaMessages: Array<{ type: 'success' | 'error'; message: string }>;
  omekaMinimal?: boolean;
  disposableApis: ApiClient[];
}
