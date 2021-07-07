import { stringify } from 'query-string';
import { ApiClient } from '../../gateway/api';
import { BaseExtension, defaultDispose } from '../extension-manager';
import { SiteUser, User } from './types';

export class SiteManagerExtension implements BaseExtension {
  api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  dispose() {
    defaultDispose(this);
  }

  getAllSites() {
    return this.api.request<{
      sites: Array<{
        id: number;
        title: string;
        slug: string;
        summary?: string;
        created: Date;
        modified: Date | null;
        is_public: boolean;
      }>;
    }>(`/api/madoc/sites`);
  }

  getAllSiteUsers() {
    return this.api.request<{ users: SiteUser[] }>(`/api/madoc/manage-site/users`);
  }

  async updateUserRole(userId: number, site_role: string) {
    return this.api.request(`/api/madoc/manage-site/users/${userId}/role`, {
      method: 'POST',
      body: {
        site_role,
      },
    });
  }

  async removeUserRole(userId: number) {
    return this.api.request(`/api/madoc/manage-site/users/${userId}/role`, {
      method: 'DELETE',
    });
  }

  async searchAllUsers(q: string) {
    return this.api.request<{ users: User[] }>(`/api/madoc/manage-site/users/search?${stringify({ q })}`);
  }
}
