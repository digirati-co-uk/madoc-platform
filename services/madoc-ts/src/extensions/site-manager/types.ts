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
};

export type CreateSiteRequest = {
  slug: string;
  title: string;
  is_public?: boolean;
  summary?: string;
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
  is_active: boolean;
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

export type PasswordCreationRow = {
  id: string;
  user_id: number;
  created: string;
  activate: boolean;
};

export type UserInvitationsRequest = {
  invitation_id: string;
  role: string;
  site_role: string;
  expires: Date;
  uses_left?: number;
  message?: InternationalString;
};

export type UserInvitationsRow = {
  id: number;
  invitation_id: string;
  owner_id: number;
  site_id: number;
  role: string;
  site_role: string;
  expires: string;
  created_at: string;
  uses_left?: number | null;
  message?: InternationalString | null;

  // Joins.
  redeem_user_id?: number;
  redeem_user_name?: string;
  redeem_redeemed_at?: string;
};

export type UserInvitation = {
  id: number;
  invitation_id: string;
  createdAt: Date;
  expires: Date;
  detail: {
    role: string;
    site_role: string;
    message: InternationalString;
  };
  users: Array<{ id: number; name?: string; redeemed_at?: Date }>;
};
