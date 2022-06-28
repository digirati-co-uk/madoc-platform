import { i18n } from 'i18next';
import { PluginManager } from '../frontend/shared/plugins/plugin-manager';
import { ChangeDiscoveryRepository } from '../activity-streams/change-discovery-repository';
import { ApiClient } from '../gateway/api';
import { AnnotationStylesRepository } from '../repository/annotation-styles-repository';
import { MediaRepository } from '../repository/media-repository';
import { NotificationRepository } from '../repository/notification-repository';
import { PageBlocksRepository } from '../repository/page-blocks-repository';
import { PluginRepository } from '../repository/plugin-repository';
import { ProjectRepository } from '../repository/project-repository';
import { SiteUserRepository } from '../repository/site-user-repository';
import { ThemeRepository } from '../repository/theme-repository';
import { CronJobs } from '../utility/cron-jobs';
import { Mailer } from '../utility/mailer';
import { ExternalConfig } from './external-config';
import { router } from '../router';
import { DatabasePoolConnectionType } from 'slonik';
import { Ajv } from 'ajv';
import {ApiKeyRepository} from '../repository/api-key-repository';

type AllRoutes = typeof router;

declare module 'koa' {
  interface Context {
    i18next: i18n;
    externalConfig: ExternalConfig;
    routes: AllRoutes;
    connection: DatabasePoolConnectionType;
    pageBlocks: PageBlocksRepository;
    plugins: PluginRepository;
    themes: ThemeRepository;
    media: MediaRepository;
    apiKeys: ApiKeyRepository;
    annotationStyles: AnnotationStylesRepository;
    mailer: Mailer;
    notifications: NotificationRepository;
    projects: ProjectRepository;
    changeDiscovery: ChangeDiscoveryRepository;
    siteManager: SiteUserRepository;
    pluginManager: PluginManager;
    cron: CronJobs;
    ajv: Ajv;
    staticPage?: string | ((token: string) => Promise<string | undefined>) | ((token: string) => undefined | string);
    disposableApis: ApiClient[];

    // New frontend
    adminTemplate: string;
    siteTemplate: string;
  }
}
