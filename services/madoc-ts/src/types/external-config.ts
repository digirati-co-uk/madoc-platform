import { ProjectConfiguration } from './schemas/project-configuration';

export type ExternalConfig = {
  cookieName?: string;
  tokenExpires?: number;
  tokenRefresh?: number;
  pooledDatabase?: boolean;
  defaultSiteConfiguration: ProjectConfiguration;
  permissions: {
    [role: string]: string[];
  };
};
