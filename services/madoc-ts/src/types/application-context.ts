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
import { Mailer } from '../utility/mailer';
import { ExternalConfig } from './external-config';
import { router } from '../router';
import { DatabasePoolConnectionType } from 'slonik';
import { Ajv } from 'ajv';

export interface ApplicationContext {
  i18next: i18n;
  externalConfig: ExternalConfig;
  routes: typeof router;
  connection: DatabasePoolConnectionType;
  pageBlocks: PageBlocksRepository;
  plugins: PluginRepository;
  themes: ThemeRepository;
  media: MediaRepository;
  mailer: Mailer;
  notifications: NotificationRepository;
  changeDiscovery: ChangeDiscoveryRepository;
  siteManager: SiteUserRepository;
  pluginManager: PluginManager;
  cron: CronJobs;
  ajv: Ajv;
  staticPage?: string | ((token: string) => Promise<string | undefined>) | ((token: string) => undefined | string);
  disposableApis: ApiClient[];
}
