import { ProjectConfiguration } from './schemas/project-configuration';

export type ExternalConfig = {
  cookieName?: string;
  tokenExpires?: number;
  defaultSiteConfiguration: ProjectConfiguration;
  permissions: {
    [role: string]: string[];
  };
};
