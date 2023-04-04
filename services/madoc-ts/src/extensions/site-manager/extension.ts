import { stringify } from 'query-string';
import { ApiClient } from '../../gateway/api';
import { Pagination } from '../../types/schemas/_pagination';
import { BaseExtension, defaultDispose } from '../extension-manager';
import {
  CreateSiteRequest,
  GetUser,
  Site,
  SiteUser,
  SystemConfig,
  UpdateInvitation,
  UpdateSiteRequest,
  UpdateUser,
  User,
  UserCreationRequest,
  UserInvitation,
  UserInvitationPostBody,
} from './types';

export class SiteManagerExtension implements BaseExtension {
  api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  dispose() {
    defaultDispose(this);
  }

  getAllSites(query?: { order_by?: 'title' | 'slug' | 'modified' | 'created'; desc?: boolean }) {
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
      siteStats: {
        [k: number]: {
          projects?: number;
          collection?: number;
          manifests?: number;
          canvas?: number;
        };
      };
    }>(`/api/madoc/sites${query ? `?${stringify(query)}` : ``}`);
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
    return this.api.request<{ users: User[] }>(`/api/madoc/users/search?${stringify({ q })}`);
  }

  async listInvitations() {
    return this.api.request<{ invitations: UserInvitation[] }>(`/api/madoc/manage-site/invitations`);
  }

  async getInvitation(invitationId: string) {
    return this.api.request<UserInvitation>(`/api/madoc/manage-site/invitations/${invitationId}`);
  }

  async resetPassword(userId: number, body: { skipEmail?: boolean } = {}) {
    return this.api.request<{ accepted: true } | { accepted: false; verificationLink: string }>(
      `/api/madoc/users/${userId}/reset-password`,
      {
        method: 'POST',
        body,
      }
    );
  }

  async createInvitation(req: UserInvitationPostBody) {
    return this.api.request<UserInvitation>(`/api/madoc/manage-site/invitations`, {
      method: 'POST',
      body: req,
    });
  }

  async updateInvitation(invitationId: string, req: UpdateInvitation) {
    return this.api.request(`/api/madoc/manage-site/invitations/${invitationId}`, {
      method: 'PUT',
      body: req,
    });
  }

  async deleteInvitation(invitationId: string) {
    return this.api.request(`/api/madoc/manage-site/invitations/${invitationId}`, {
      method: 'DELETE',
    });
  }

  async createUser(req: UserCreationRequest) {
    return this.api.request<User & { verificationLink?: string; emailError?: boolean }>(`/api/madoc/users`, {
      method: 'POST',
      body: req,
    });
  }

  async activateUser(userId: number) {
    return this.api.request(`/api/madoc/users/${userId}/activate`, {
      method: 'POST',
    });
  }

  async deactivateUser(userId: number) {
    return this.api.request(`/api/madoc/users/${userId}/deactivate`, {
      method: 'POST',
    });
  }

  async deleteUser(userId: number) {
    return this.api.request(`/api/madoc/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async updateUser(userId: number, req: UpdateUser) {
    return this.api.request(`/api/madoc/users/${userId}`, {
      method: 'PUT',
      body: req,
    });
  }

  async createSite(site: CreateSiteRequest) {
    return this.api.request<{ site: Site }>(`/api/madoc/sites`, {
      method: 'POST',
      body: site,
    });
  }

  async updateSite(site: Partial<UpdateSiteRequest>) {
    return this.api.request(`/api/madoc/manage-site/details`, {
      method: 'PUT',
      body: site,
    });
  }

  async listAllUsers(page = 1) {
    return this.api.request<{ users: User[]; pagination: Pagination }>(`/api/madoc/users?${stringify({ page })}`);
  }

  async getUserById(userId: number) {
    return this.api.request<GetUser>(`/api/madoc/users/${userId}`);
  }

  async getSystemConfig() {
    return this.api.request<SystemConfig>(`/api/madoc/system/config`);
  }

  async updateSystemConfig(config: Partial<SystemConfig>) {
    return this.api.request(`/api/madoc/system/config`, {
      method: 'POST',
      body: config,
    });
  }
}
