import { CachedApiHelper } from '../utility/cached-api-helper';
import { AuthenticatedUser } from './authenticated-user';
import { ApiClient } from '../gateway/api';
import { PublicSite } from '../utility/omeka-api';

export interface ApplicationState {
  // User.
  // JWT.
  // Role.
  // etc...
  authenticatedUser?: AuthenticatedUser;
  loggedOut?: boolean;
  siteApi: ApiClient;
  cachedApi: CachedApiHelper;
  site: PublicSite;
  jwt?: {
    token: string;
    scope: string[];
    context: string[];
    site: {
      gateway: boolean;
      id: number;
      name: string;
    };
    user: {
      name: string;
      id?: number;
      service: boolean;
      serviceId?: string;
    };
  };
}
