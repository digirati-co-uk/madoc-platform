import { AuthenticatedUser } from './authenticated-user';

export interface ApplicationState {
  // User.
  // JWT.
  // Role.
  // etc...
  authenticatedUser?: AuthenticatedUser;
  loggedOut?: boolean;
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
