import { ProjectConfiguration } from './schemas/project-configuration';

export type ExternalConfig = {
  cookieName?: string;
  tokenExpires?: number;
  tokenRefresh?: number;
  defaultSiteConfiguration: ProjectConfiguration;
  permissions: {
    [role: string]: string[];
  };
};
