import { stringify } from 'query-string';
import { ApiClient } from '../../gateway/api';
import { AwardBadgeRequest, Badge, BadgeAward, CreateBadgeRequest } from '../../types/badges';
import { Pagination } from '../../types/schemas/_pagination';
import { SiteTerms } from '../../types/site-terms';
import { TermConfiguration, TermConfigurationRequest } from '../../types/term-configurations';
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

  async listAllUsers(
    page = 1,
    query: {
      role?: string;
      roles?: string[];
      status?: string;
      automated?: boolean;
    } = {},
    sort?: {
      name: string;
      direction: 'asc' | 'desc';
    }
  ) {
    return this.api.request<{ users: User[]; pagination: Pagination }>(
      `/api/madoc/users?${stringify({ page, ...query, sort_by: sort ? `${sort.name}:${sort?.direction}` : undefined })}`
    );
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

  // Term configurations
  async getTermConfiguration(id: string) {
    return this.api.request<TermConfiguration>(`/api/madoc/term-configuration/${id}`);
  }

  async updateTermConfiguration(id: string, config: TermConfigurationRequest & { id: string }) {
    return this.api.request(`/api/madoc/term-configuration/${id}`, {
      method: 'PUT',
      body: config,
    });
  }

  async createTermConfiguration(config: TermConfigurationRequest) {
    return this.api.request<TermConfiguration>(`/api/madoc/term-configuration`, {
      method: 'POST',
      body: config,
    });
  }

  async deleteTermConfiguration(id: string) {
    return this.api.request(`/api/madoc/term-configuration/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllTermConfigurations() {
    return this.api.request<{ termConfigurations: TermConfiguration[] }>(`/api/madoc/term-configuration`);
  }

  // Badges
  async createBadge(badge: CreateBadgeRequest) {
    return this.api.request<Badge>(`/api/madoc/badges`, {
      method: 'POST',
      body: badge,
    });
  }

  async getBadge(id: string) {
    return this.api.request<Badge>(`/api/madoc/badges/${id}`);
  }

  async updateBadge(id: string, badge: CreateBadgeRequest) {
    return this.api.request<Badge>(`/api/madoc/badges/${id}`, {
      method: 'PUT',
      body: badge,
    });
  }

  async deleteBadge(id: string) {
    await this.api.request(`/api/madoc/badges/${id}`, {
      method: 'DELETE',
    });
  }

  async listBadges() {
    return this.api.request<{ badges: Badge[] }>(`/api/madoc/badges`);
  }

  //User badges
  async listUserAwardedBadges(userId: number) {
    return this.api.request<{ awards: BadgeAward[] }>(`/api/madoc/users/${userId}/badges`);
  }

  async getAwardedBadge(userId: number, id: string) {
    return this.api.request<BadgeAward>(`/api/madoc/users/${userId}/badges/${id}`);
  }

  async awardBadge(userId: number, badge: AwardBadgeRequest) {
    return this.api.request<BadgeAward>(`/api/madoc/users/${userId}/badges`, {
      method: 'POST',
      body: badge,
    });
  }

  async removeAwardedBadge(userId: number, id: string) {
    await this.api.request(`/api/madoc/users/${userId}/badges/${id}`, {
      method: 'DELETE',
    });
  }

  async listTerms() {
    return this.api.request<{ terms: SiteTerms[] }>(`/api/madoc/terms`);
  }

  async getLatestTerms() {
    return this.api.request<{ latest: SiteTerms; list: Omit<SiteTerms, 'terms'>[] }>(`/api/madoc/terms/latest`);
  }

  async acceptTerms() {
    return this.api.request(`/api/madoc/terms/accept`, {
      method: 'POST',
    });
  }

  async getTermsById(termsId: string) {
    return this.api.request<SiteTerms>(`/api/madoc/terms/${termsId}`);
  }

  async createTerms(terms: { text: string; markdown: string }) {
    return this.api.request<SiteTerms>(`/api/madoc/terms`, {
      method: 'POST',
      body: terms,
    });
  }

  async deleteTerms(termsId: string) {
    return this.api.request(`/api/madoc/terms/${termsId}`, {
      method: 'DELETE',
    });
  }
}
