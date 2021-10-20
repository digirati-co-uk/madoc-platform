import { InternationalString } from '@hyperion-framework/types/iiif/descriptive';

export type Site = {
  id: number;
  slug: string;
  title: string;
  is_public: boolean;
  summary?: string;
  created: Date;
  modified?: Date;
  owner?: { id: number; name?: string };
  config: SiteSystemConfig;
};

export type SiteSystemConfig = {
  enableRegistrations: boolean;
  emailActivation: boolean;
  enableNotifications: boolean;
};

export type SystemConfig = {
  installationTitle: string;
  defaultSite: string | null;
} & SiteSystemConfig;

export type CreateSiteRequest = {
  slug: string;
  title: string;
  is_public?: boolean;
  summary?: string;
  config?: SiteSystemConfig;
};

export type UpdateSiteRequest = {
  title: string;
  summary: string | null;
  is_public: boolean;
  owner_id?: number | null;
  config?: Partial<SiteSystemConfig> | null;
};

export type SiteRow = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  is_public: boolean;
  owner_id?: number | null;
  owner_name?: string | null;
  created: string;
  modified?: string;
  config?: Partial<SiteSystemConfig> | null;
};

export type LegacySiteRow = SiteRow & {
  item_pool: string; // JSON.
  navigation: string; // JSON.
  theme: string; // No longer required.
  // is_public: 0 | 1;
};

export type UserRowWithoutPassword = {
  id: number;
  email: string;
  name: string;
  created: string;
  modified?: string | null;
  password_hash: never;
  role: string;
  site_role?: string;
  is_active: boolean;
};

export type GetUser = {
  user: User;
  sites: UserSite[];
};

export type User = {
  id: number;
  email: string;
  name: string;
  created: Date;
  modified?: Date;
  password_hash: never;
  role: string;
  is_active: boolean;
};

export type UserCreationRequest = {
  email: string;
  name: string;
  role: string;
  skipEmail?: boolean;
};

/**
 * Requirements for a site user:
 * - Active in the database
 * - Fetched with a site_id check, so will have role on site
 */
export type SiteUser = {
  id: number;
  name: string;
  /**
   * This is always the global role, never the site role.
   */
  role: string;
  /**
   * This is ONLY the site role.
   */
  site_role?: string;

  email?: string;
};

export type CurrentUserWithScope = SiteUser & {
  scope: string[];
};

export type UpdateUser = {
  email?: string;
  name?: string;
  role?: string;
};

export type UserRow = {
  id: number;
  email: string;
  name: string;
  created: string;
  modified: string;
  password_hash: string | null;
  role: string;
  is_active: boolean;
};

export type LegacyUserRow = UserRow & {
  // is_active: 1 | 0; //
};

export type SitePermission = {
  site_id: number;
  user_id: number;
  role: string;
};

export type SitePermissionRow = {
  site_id: number;
  user_id: number;
  role: string;
};

export type LegacySitePermissionRow = SitePermissionRow;

export type UserSite = { id: number; role: string; slug: string; title: string };

export type UserInvitationsRequest = {
  invitation_id: string;
  role: string;
  site_role: string;
  expires?: Date | null;
  uses_left?: number;
  message?: InternationalString;
  config?: Partial<UserInvitationConfig>;
};

export type UserInvitationPostBody = {
  site_role: string;
  expires?: string | null;
  uses_left?: number;
  message?: InternationalString;
  config?: Partial<UserInvitationConfig>;
};

export type UpdateInvitation = {
  message?: InternationalString;
  uses_left?: number;
  expires?: string;
  role?: string;
  site_role?: string;
  config?: Partial<UserInvitationConfig>;
};

export type UserInvitationsRow = {
  id: number;
  invitation_id: string;
  owner_id: number;
  site_id: number;
  role: string;
  site_role: string;
  expires?: string;
  created_at: string;
  uses_left?: number | null;
  message?: InternationalString | null;

  // Joins.
  redeem_user_id?: number;
  redeem_user_name?: string;
  redeem_redeemed_at?: string;
  redeem_user_email?: string;
  config?: Partial<UserInvitationConfig> | null;
};

export type UserInvitationConfig = {
  allowExistingUsers: boolean;
  allowRoleChange: boolean;
  singleUserId: number | null;
  singleUserEmail: string | null;
};

export type UserInvitation = {
  id: string;
  createdAt: Date;
  expires?: Date;
  detail: {
    role: string;
    site_role: string;
    message: InternationalString;
    usesLeft?: number;
  };
  users: Array<{ id: number; name?: string; redeemed_at?: Date; email?: string }>;
  config: UserInvitationConfig;
};

export type PasswordCreationRow = {
  id: string;
  user_id: number;
  shared_hash: string | null;
  created: string;
  activate: boolean;
};
