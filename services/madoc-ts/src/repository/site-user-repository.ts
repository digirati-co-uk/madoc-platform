import cache from 'memory-cache';
import { DatabasePoolConnectionType, DatabaseTransactionConnectionType, NotFoundError, sql } from 'slonik';
import {
  CreateSiteRequest,
  CurrentUserWithScope,
  LegacySiteRow,
  PasswordCreationRow,
  Site,
  SitePermissionRow,
  SiteRow,
  SiteUser,
  UpdateInvitation,
  UpdateSiteRequest,
  UpdateUser,
  User,
  UserCreationRequest,
  UserInvitation,
  UserInvitationsRequest,
  UserInvitationsRow,
  UserRow,
  UserRowWithoutPassword,
  UserSite,
  SystemConfig,
} from '../extensions/site-manager/types';
import { ExternalConfig } from '../types/external-config';
import { NotFound } from '../utility/errors/not-found';
import { SiteNotFound } from '../utility/errors/site-not-found';
import { parseJWT } from '../utility/parse-jwt';
import { phpHashCompare } from '../utility/php-hash-compare';
import { passwordHash } from '../utility/php-password-hash';
import { SQL_COMMA, SQL_EMPTY } from '../utility/postgres-tags';
import { sqlDate, upsert } from '../utility/slonik-helpers';
import { verifySignedToken } from '../utility/verify-signed-token';
import { BaseRepository } from './base-repository';

/**
 * Site + User repository.
 *
 * Synced tables
 * - site
 * - site_permission
 * - user
 * - user_invitations
 * - password_creation
 *
 * Sync process
 * - Adding in missing items
 * - Changing items
 * - Removing items no longer required
 *
 * Site actions
 * - Creating sites
 * - Updating site details (slug / title)
 * - General site settings (registration, activation etc)
 *
 * Site user actions
 * - User roles + permissions
 * - User invitations
 * - Listing users sites
 * - Get users
 * - Autocomplete users by role
 *
 * User actions
 * - Create user
 * - Activate user
 * - Update user details
 * - Reset user password
 * - Register user
 * - Deactivate user
 * - Invite user to site
 *
 */

export class SiteUserRepository extends BaseRepository {
  constructor(postgres: DatabasePoolConnectionType | DatabaseTransactionConnectionType) {
    super(postgres);
  }

  static query = {
    // ==============================
    // Sites
    // ==============================

    listAllSites: ({ orderBy, orderDesc }: { orderBy?: string; orderDesc?: boolean } = {}) => {
      let sort = SQL_EMPTY;
      const sortDir = orderDesc ? sql`desc` : sql`asc`;
      switch (orderBy) {
        case 'title':
          sort = sql`order by site.title ${sortDir}`;
          break;
        case 'slug':
          sort = sql`order by site.slug ${sortDir}`;
          break;
        case 'modified':
          sort = sql`order by site.modified ${sortDir}`;
          break;
        case 'created':
          sort = sql`order by site.created ${sortDir}`;
          break;
      }

      return sql<SiteRow>`
          select site.*, u.name as owner_name
          from site
             left join "user" u on site.owner_id = u.id
          ${sort}
      `;
    },

    getSiteById: (id: number) => sql<SiteRow>`
        ${SiteUserRepository.query.listAllSites()}
        where site.id = ${id}
    `,

    getSiteBySlug: (slug: string) => sql<SiteRow>`
        ${SiteUserRepository.query.listAllSites()}
        where site.slug = ${slug}
    `,

    getSiteUserById: (id: number, siteId: number) => sql<SiteUser>`
        select id, name, "user".role, sp.role as site_role
        from "user"
                 left outer join site_permission sp on "user".id = sp.user_id and sp.site_id = ${siteId}
        where id = ${id}
          and is_active = true;
    `,

    // ==============================
    // Users
    // ==============================

    countAllUsers: () => sql<{ total_users: number }>`select COUNT(*) as total_users from "user"`,

    getAllUsers: (page: number, perPage: number) => sql<UserRowWithoutPassword>`
      select id, email, name, created, modified, role, is_active, automated
        from "user" limit ${perPage} offset ${(page - 1) * perPage};
    `,

    getUserById: (id: number) => sql<UserRowWithoutPassword>`
        select id, email, name, created, modified, role, is_active, automated, config
        from "user"
        where id = ${id};
    `,

    getUserByEmail: (email: string) => sql<UserRowWithoutPassword>`
        select id, lower(email) as email, name, created, modified, role, is_active, automated, config
        from "user"
        where email = ${email};
    `,

    getSiteCreator: (siteId: number) => sql<SiteUser>`
        select u.id, u.name, u.role
        from "user" u
                 left join site s on u.id = s.owner_id
        where s.id = ${siteId} and u.is_active = true
    `,

    getUsersByRoles: (siteId: number, roles: string[], includeAdmins = true) =>
      sql<SiteUser>`
          select u.id, u.name, u.role, u.automated, sp.role as site_role
          from "user" u
                   left join site_permission sp on u.id = sp.user_id
          where sp.site_id = ${siteId}
            and u.is_active = true
            and (
              sp.role = ANY (${sql.array(roles, 'text')}) 
              ${includeAdmins ? sql`or sp.role = 'admin'` : SQL_EMPTY}
            )
      `,

    getAuthenticatedSites: (userId: number) => sql<UserSite>`
      select s.id, sp.role, s.slug, s.title 
      from site_permission sp 
        left join site s on sp.site_id = s.id 
      where user_id=${userId}
    `,

    getPublicSites: (userId: number) => sql<UserSite>`
      select s.id, s.slug, s.title, 'viewer' as role 
      from site s 
      where s.is_public = true or s.owner_id=${userId}
    `,

    getActiveUserById: (userId: number) => sql<UserRowWithoutPassword>`
      select id, name, lower(email) as email, role, is_active, created, modified, automated, config 
      from "user" 
      where is_active = true and id = ${userId}
    `,

    getActiveUserByEmail: (email: string) => sql<UserRow>`
      select id, name, lower(email) as email, created, modified, password_hash, role, is_active, automated 
      from "user" 
      where is_active = true and email = ${email}
    `,

    getSiteUsers: (siteId: number) => sql<SiteUser>`
      select u.id, u.name, u.role, u.automated, sp.role as site_role from "user" u
        left join site_permission sp on u.id = sp.user_id
      where sp.site_id = ${siteId}
    `,

    searchUsers: (q: string, siteId: number, roles: string[] = []) => {
      const query = `%${q || ''}%`;

      return sql<SiteUser>`
        select u.id, u.name, u.role, sp.role as site_role
        from "user" u 
          left join site_permission sp 
              on u.id = sp.user_id 
        where sp.site_id = ${siteId} 
          ${q ? sql`and (u.email ilike ${query} or u.name ilike ${query})` : SQL_EMPTY}   
          ${roles.length ? sql`and sp.role = ANY(${sql.array(roles, 'text')}) and sp.role is not null` : SQL_EMPTY}
        group by u.id, sp.user_id, sp.role limit 50
      `;
    },

    searchAllUsers: (q: string) => sql<UserRowWithoutPassword>`
      select u.id, lower(u.email) as email, u.name, u.role from "user" as u
        where u.is_active = true
        and (
          u.email ilike ${'%' + q + '%'} or u.name ilike ${'%' + q + '%'}
        )
        limit 20
    `,

    // ==============================
    // Invitations
    // ==============================

    getInvitations: (siteId: number) => sql<UserInvitationsRow>`
      select * from user_invitations where site_id = ${siteId}
    `,

    getInvitation: (invitationId: string, siteId: number) => sql<UserInvitationsRow>`
      select ui.*, uir.user_id as redeem_user_id, u.name as redeem_user_name, lower(u.email) as redeem_user_email, uir.redeemed_at as redeem_redeemed_at from user_invitations ui
        left join user_invitations_redeem uir on ui.id = uir.invite_id
        left join "user" u on uir.user_id = u.id
        where site_id = ${siteId} and ui.invitation_id = ${invitationId}
    `,

    // ==============================
    // Password reset
    // ==============================

    getPasswordReset: (id: string) => sql<PasswordCreationRow>`
      select * from password_creation where id = ${id}
    `,

    getSystemConfig: () => sql<{ key: string; value: { value: any } }>`select * from system_config`,
  };

  static mutations = {
    updateUserPassword: (userId: number, hash: string) => sql`
      update "user" set password_hash = ${hash} where id = ${userId} and automated = false
    `,
    setUsersRoleOnSite: (siteId: number, userId: number, role: string) =>
      upsert<SitePermissionRow>(
        'site_permission',
        ['site_id', 'user_id'],
        [
          {
            site_id: siteId,
            user_id: userId,
            role: role,
          },
        ],
        ['site_id', 'user_id', 'role']
      ),

    removeUserRoleOnSite: (siteId: number, userId: number) => sql`
      delete from site_permission where site_id = ${siteId} and user_id = ${userId}
    `,

    createUserWithId: (id: number, user: UserCreationRequest) => sql<UserRow>`
      insert into "user" (id, email, name, is_active, role, password_hash, created_by) values (
        ${id},
        ${user.email.toLowerCase()},
        ${user.name},
        false,
        ${user.role},
        null,
        ${user.creator || null}
       ) returning *
    `,

    createUser: (user: UserCreationRequest) => sql<UserRow>`
      insert into "user" (email, name, is_active, role, password_hash, created_by) values (
        ${user.email.toLowerCase()},
        ${user.name},
        false,
        ${user.role},
        null,
        ${user.creator || null}
       ) returning *
    `,

    createAutomatedUser: (user: UserCreationRequest) => sql<UserRow>`
      insert into "user" (email, name, is_active, role, password_hash, automated, created_by) values (
        ${user.email.toLowerCase()},
        ${user.name},
        true,
        ${user.role},
        null,
        true,
        ${user.creator || null}
       ) returning *
    `,

    setUserPassword: (userId: number, hash: string) => sql`
      update "user" set password_hash = ${hash} where id = ${userId} and automated = false
    `,

    resetPassword: (id: string, sharedHash: string, userId: number, activate: boolean) => sql`
      insert into password_creation (id, shared_hash, user_id, activate) 
        values (${id}, ${sharedHash}, ${userId}, ${Boolean(activate)})
    `,

    removeResetPassword: (c2: string) => sql`
      delete from password_creation where id = ${c2}
    `,

    activateUser: (userId: number) => sql`
      update "user" set is_active = true where id = ${userId}
    `,

    deactivateUser: (userId: number) => sql`
      update "user" set is_active = false where id = ${userId} and automated = false
    `,

    deleteUser: (userId: number) => sql`
      delete from "user" where id = ${userId} and is_active = false
    `,

    deleteSite: (siteId: number) => sql`
      delete from site where id = ${siteId} and is_public = false
    `,

    changeSiteVisibility: (siteId: number, isPublic: boolean) => sql`
      update site set is_public = ${Boolean(isPublic)} where id = ${siteId}
    `,

    createInvitation: (req: UserInvitationsRequest, siteId: number, ownerId: number) => sql<UserInvitationsRow>`
      insert into user_invitations (invitation_id, owner_id, site_id, role, site_role, expires, uses_left, message, config) values (
        ${req.invitation_id},
        ${ownerId},
        ${siteId},
        ${req.role},
        ${req.site_role},                                                                                         
        ${req.expires ? sqlDate(req.expires) : null},
        ${req.uses_left || null},
        ${sql.json(req.message || {})},
        ${sql.json(req.config || {})}
      ) returning *
    `,

    updateInvitation: (invitationId: string, siteId: number, req: UpdateInvitation) => {
      const setValues = [];
      if (typeof req.message !== 'undefined') {
        setValues.push(sql`message = ${sql.json(req.message)}`);
      }
      if (typeof req.config !== 'undefined') {
        setValues.push(sql`config = ${sql.json(req.config)}`);
      }
      if (typeof req.site_role !== 'undefined') {
        setValues.push(sql`site_role = ${req.site_role}`);
      }
      if (typeof req.expires !== 'undefined') {
        setValues.push(sql`expires = ${req.expires ? sqlDate(new Date(req.expires)) : null}`);
      }
      if (typeof req.role !== 'undefined') {
        setValues.push(sql`role = ${req.role}`);
      }
      if (typeof req.uses_left !== 'undefined') {
        setValues.push(sql`uses_left = ${req.uses_left}`);
      }

      if (setValues.length === 0) {
        throw new Error('Invalid update request');
      }

      return sql`
        update user_invitations
        set ${sql.join(setValues, SQL_COMMA)}
        where site_id = ${siteId} and invitation_id = ${invitationId}
      `;
    },

    updateUser: (userId: number, req: UpdateUser) => {
      const setValues = [];

      if (typeof req.role !== 'undefined') {
        setValues.push(sql`role = ${req.role}`);
      }
      if (typeof req.name !== 'undefined') {
        setValues.push(sql`name = ${req.name}`);
      }
      if (typeof req.email !== 'undefined') {
        setValues.push(sql`email = ${req.email.toLowerCase()}`);
      }

      if (setValues.length === 0) {
        throw new Error('Invalid update request');
      }

      return sql`
        update "user" u
        set ${sql.join(setValues, SQL_COMMA)}, modified = CURRENT_TIMESTAMP
        where u.id = ${userId}
      `;
    },

    useInvitation: (invitationId: string, siteId: number) => sql<UserInvitationsRow>`
      update user_invitations
        set uses_left = uses_left::int - 1
      where invitation_id = ${invitationId} and site_id = ${siteId}
    `,

    createInvitationRedemption: (invitationId: number, userId: number) => sql`
      insert into user_invitations_redeem (user_id, invite_id) values (${userId}, ${invitationId})
    `,

    deleteInvitation: (invitationId: string, siteId: number) => sql`
      delete from user_invitations where invitation_id = ${invitationId} and site_id = ${siteId}
    `,

    createSite: (req: CreateSiteRequest, userId: number) => sql`
      insert into site (owner_id, title, slug, is_public, summary, config) values (
        ${userId},
        ${req.title},
        ${req.slug},
        ${Boolean(req.is_public)},
        ${req.summary || ''},
        ${sql.json(req.config || {})}
      )
    `,

    updateSite: (siteId: number, req: Partial<UpdateSiteRequest>) => {
      const setValues = [];
      if (typeof req.title !== 'undefined') {
        setValues.push(sql`title = ${req.title}`);
      }
      if (typeof req.summary !== 'undefined') {
        setValues.push(sql`summary = ${req.summary}`);
      }
      if (typeof req.is_public !== 'undefined') {
        setValues.push(sql`is_public = ${Boolean(req.is_public)}`);
      }
      if (typeof req.owner_id !== 'undefined') {
        setValues.push(sql`owner_id = ${req.owner_id}`);
      }
      if (typeof req.config !== 'undefined') {
        setValues.push(sql`config = ${sql.json(req.config)}`);
      }

      if (setValues.length === 0) {
        throw new Error('Invalid update request');
      }

      return sql`update site set ${sql.join(setValues, SQL_COMMA)} where id = ${siteId}`;
    },

    setSystemConfigValue: (key: string, value: string) => sql`
      insert into system_config (key, value) values (${key}, ${sql.json({ value })}) 
      on conflict (key) do update set
        value = ${sql.json({ value })}
    `,
  };

  static mapUser(row: UserRowWithoutPassword | UserRow): User {
    return {
      id: row.id,
      email: row.email?.toLowerCase(),
      role: row.role,
      name: row.name,
      created: new Date(row.created),
      modified: row.modified ? new Date(row.modified) : undefined,
      is_active: Boolean(row.is_active),
      automated: Boolean(row.automated),
    } as User;
  }

  static mapSite(row: SiteRow | LegacySiteRow): Site {
    return {
      id: row.id,
      is_public: Boolean(row.is_public),
      owner: row.owner_id ? { id: row.owner_id, name: row.owner_name || undefined } : undefined,
      modified: row.modified ? new Date(row.modified) : undefined,
      created: new Date(row.created),
      summary: row.summary || undefined,
      slug: row.slug,
      title: row.title,
      config: {
        emailActivation: true,
        enableNotifications: true,
        enableRegistrations: true,
        registeredUserTranscriber: false,
        ...(row.config || {}),
      },
    } as Site;
  }

  static mapInvitation(row: UserInvitationsRow): UserInvitation {
    return {
      _id: row.id,
      id: row.invitation_id,
      expires: row.expires ? new Date(row.expires) : undefined,
      createdAt: new Date(row.created_at),
      detail: {
        role: row.role,
        site_role: row.site_role,
        usesLeft: row.uses_left || undefined,
        message:
          typeof row.message === 'string'
            ? {
                none: [row.message],
              }
            : row.message || {},
      },
      config: {
        allowExistingUsers: true,
        allowRoleChange: true,
        singleUserId: null,
        singleUserEmail: null,
        ...(row.config || {}),
      },
      users: [],
    };
  }

  static mapInvitationWithUsers(invitations: readonly UserInvitationsRow[]): UserInvitation {
    const reduced = invitations.reduce(SiteUserRepository.reduceInvitations, {} as any);
    return reduced[invitations[0].id];
  }

  static reduceInvitations(
    state: { [id: string]: UserInvitation },
    row: UserInvitationsRow
  ): { [id: string]: UserInvitation } {
    if (!state[row.id]) {
      state[row.id] = SiteUserRepository.mapInvitation(row);
    }

    if (row.redeem_user_id) {
      if (!state[row.id].users.find(u => u.id === row.redeem_user_id)) {
        state[row.id].users.push({
          id: row.redeem_user_id,
          name: row.redeem_user_name || undefined,
          email: row.redeem_user_email || undefined,
          redeemed_at: row.redeem_redeemed_at ? new Date(row.redeem_redeemed_at) : undefined,
        });
      }
    }

    return state;
  }

  static compatibility = {
    site: (site: LegacySiteRow): Omit<SiteRow, 'created' | 'modified'> & { created: Date; modified?: Date } => {
      return {
        ...site,
        created: new Date(site.created),
        modified: site.modified ? new Date(site.modified) : undefined,
        is_public: Boolean(site.is_public),
      };
    },
  };

  async getSystemConfig(cached = true): Promise<SystemConfig> {
    const cacheKey = `madoc-system-config`;
    const cachedConfig = cache.get(cacheKey) as SystemConfig;
    if (cachedConfig && cached) {
      return cachedConfig;
    }

    const defaultConfig: SystemConfig = {
      installationTitle: 'Madoc',
      enableRegistrations: true,
      registeredUserTranscriber: false,
      enableNotifications: true,
      emailActivation: true,
      defaultSite: null,
      autoPublishImport: true,
    };

    const global = await this.connection.any(SiteUserRepository.query.getSystemConfig());

    for (const item of global) {
      if (item.value && typeof item.value.value !== 'undefined') {
        (defaultConfig as any)[item.key] = item.value.value;
      }
    }

    cache.put(cacheKey, defaultConfig, 60 * 60 * 1000); // 1-hour cache.

    return defaultConfig;
  }

  async setSystemConfigValue(key: string, value: string) {
    cache.del('madoc-system-config');
    await this.connection.query(SiteUserRepository.mutations.setSystemConfigValue(key, value));
  }

  /**
   * This can return inactive users, use getActiveUserById() instead or check is_active
   * @throws NotFoundError
   */
  async getUserById(id: number) {
    return SiteUserRepository.mapUser(await this.connection.one(SiteUserRepository.query.getUserById(id)));
  }

  /**
   * This can return inactive users, use getActiveUserById() instead or check is_active
   * @throws NotFoundError
   */
  async getUserByEmail(email: string) {
    return this.connection.one(SiteUserRepository.query.getUserByEmail(email.toLowerCase()));
  }

  async userEmailExists(email: string) {
    try {
      await this.getUserByEmail(email.toLowerCase());
      return true;
    } catch (e) {
      if (e instanceof NotFoundError) {
        return false;
      }
      throw e;
    }
  }

  /**
   * @throws NotFoundError
   */
  async getActiveUserById(id: number): Promise<User> {
    return SiteUserRepository.mapUser(await this.connection.one(SiteUserRepository.query.getActiveUserById(id)));
  }

  /**
   * @throws NotFoundError
   */
  private async getActiveUserByEmailWithPassword(email: string): Promise<UserRow> {
    return this.connection.one(SiteUserRepository.query.getActiveUserByEmail(email.toLowerCase()));
  }

  /**
   * @throws NotFoundError
   */
  async getSiteUserById(id: number, siteId: number): Promise<SiteUser> {
    try {
      return await this.connection.one(SiteUserRepository.query.getSiteUserById(id, siteId));
    } catch (e) {
      const user = await this.getActiveUserById(id);
      if (user.role === 'global_admin') {
        return {
          id: user.id,
          email: user.email.toLowerCase(),
          role: user.role,
          site_role: 'admin',
          name: user.name,
          automated: user.automated,
        };
      }

      const site = await this.getSiteById(siteId);
      if (!site.is_public) {
        throw new NotFoundError();
      }

      return {
        id: user.id,
        email: user.email.toLowerCase(),
        role: user.role,
        site_role: 'viewer',
        name: user.name,
        automated: user.automated,
      };
    }
  }

  /**
   * @throws NotFoundError
   */
  async getSiteCreator(siteId: number) {
    return this.connection.one(SiteUserRepository.query.getSiteCreator(siteId));
  }

  async getUsersByRoles(siteId: number, roles: string[], includeAdmins = true) {
    return this.connection.any(SiteUserRepository.query.getUsersByRoles(siteId, roles, includeAdmins));
  }

  async searchUsers(q: string, siteId: number, roles: string[] = []) {
    if (!q && !roles.length) {
      return [];
    }

    return this.connection.any(SiteUserRepository.query.searchUsers(q, siteId, roles));
  }

  async searchAllUsers(q: string) {
    return this.connection.any(SiteUserRepository.query.searchAllUsers(q));
  }

  async listAllSites({ orderBy, orderDesc }: { orderBy?: string; orderDesc?: boolean } = {}) {
    return (await this.connection.any(SiteUserRepository.query.listAllSites({ orderBy, orderDesc }))).map(
      SiteUserRepository.mapSite
    );
  }

  async getSiteUsers(siteId: number): Promise<readonly SiteUser[]> {
    return await this.connection.any(SiteUserRepository.query.getSiteUsers(siteId));
  }

  /**
   * @throws NotFoundError
   */
  async getSiteById(id: number): Promise<Site> {
    return SiteUserRepository.mapSite(await this.connection.one(SiteUserRepository.query.getSiteById(id)));
  }

  /**
   * @throws NotFoundError
   */
  async getSiteBySlug(slug: string): Promise<Site> {
    return SiteUserRepository.mapSite(await this.connection.one(SiteUserRepository.query.getSiteBySlug(slug)));
  }

  /**
   * @throws NotFoundError
   */
  async getCachedSiteIdBySlug(slug: string, userId?: number, isAdmin = false): Promise<Site> {
    const cacheKey = `public-site-id:${slug}`;
    const publicSiteId: Site | undefined = cache.get(cacheKey);
    if (publicSiteId) {
      return publicSiteId;
    }
    try {
      const site = await this.getSiteBySlug(slug);

      if (site.is_public) {
        cache.put(cacheKey, site, 60 * 60 * 1000); // 1-hour cache.
      }

      if (site.is_public || isAdmin) {
        return site;
      }

      if (userId) {
        const authenticatedSites = await this.getAuthenticatedSites(userId);
        for (const authedSite of authenticatedSites) {
          if (authedSite.id === site.id) {
            return site;
          }
        }
      }
    } catch (e) {
      // let it fall through to the site not found error.
    }

    throw new SiteNotFound();
  }

  async getAuthenticatedSites(userId: number): Promise<readonly UserSite[]> {
    return await this.connection.any(SiteUserRepository.query.getAuthenticatedSites(userId));
  }

  async getPublicSites(userId: number): Promise<readonly UserSite[]> {
    return await this.connection.any(SiteUserRepository.query.getPublicSites(userId));
  }

  async getUserSites(userId: number, role?: string) {
    if (role && role === 'global_admin') {
      const sites = await this.listAllSites();
      return sites.map((s): UserSite => ({ id: s.id, slug: s.slug, title: s.title, role: 'admin' }));
    }

    const userSiteSlugs: string[] = [];
    const userSites: UserSite[] = [];

    try {
      const authedSites = await this.getAuthenticatedSites(userId);

      userSiteSlugs.push(...authedSites.map(s => s.slug));
      userSites.push(...authedSites);
    } catch (err) {
      // no-op
    }

    const publicSites = await this.getPublicSites(userId);

    for (const publicSite of publicSites) {
      if (userSiteSlugs.indexOf(publicSite.slug) === -1) {
        userSites.push(publicSite);
      }
    }

    return userSites;
  }

  /**
   * @throws NotFoundError
   */
  async getUserAndSites(id: number): Promise<{ user: User; sites: UserSite[] } | undefined> {
    const user = await this.getActiveUserById(id);

    if (!user) {
      return undefined;
    }

    const sites = await this.getUserSites(user.id, user.role);
    return { user, sites };
  }

  async countAllUsers() {
    const resp = await this.connection.one(SiteUserRepository.query.countAllUsers());
    return resp.total_users;
  }

  async getAllUsers(page: number, perPage = 50) {
    return (await this.connection.any(SiteUserRepository.query.getAllUsers(page || 1, perPage))).map(
      SiteUserRepository.mapUser
    );
  }

  /**
   * @throws NotFoundError
   */
  async verifyLogin(email: string, password: string): Promise<{ user: User; sites: UserSite[] } | undefined> {
    const user = await this.getActiveUserByEmailWithPassword(email.toLowerCase());

    if (!user || !password || !user.password_hash || user.automated) {
      return undefined;
    }

    if (await phpHashCompare(password, user.password_hash)) {
      const sites = await this.getUserSites(user.id, user.role);

      return {
        user: SiteUserRepository.mapUser(user),
        sites,
      };
    }
  }

  async getVerifiedLogin(id: number): Promise<{ user: User; sites: UserSite[] } | undefined> {
    const user = await this.getActiveUserById(id);

    if (!user) {
      return undefined;
    }

    const sites = await this.getUserSites(user.id, user.role);

    return {
      user,
      sites,
    };
  }

  async updateUserPassword(userId: number, password: string) {
    const hash = await passwordHash(password);

    await this.connection.query(SiteUserRepository.mutations.updateUserPassword(userId, hash));
  }

  async setUsersRoleOnSite(siteId: number, userId: number, role: string) {
    await this.connection.query(SiteUserRepository.mutations.setUsersRoleOnSite(siteId, userId, role));
  }

  async removeUserRoleOnSite(siteId: number, userId: number) {
    await this.connection.query(SiteUserRepository.mutations.removeUserRoleOnSite(siteId, userId));
  }

  async createUser(user: UserCreationRequest) {
    await this.connection.query(SiteUserRepository.mutations.createUser(user));

    return this.getUserByEmail(user.email.toLowerCase());
  }

  async createAutomatedUser(user: UserCreationRequest) {
    await this.connection.query(SiteUserRepository.mutations.createAutomatedUser(user));

    return this.getUserByEmail(user.email.toLowerCase());
  }

  async updateUser(userId: number, req: UpdateUser) {
    await this.connection.query(SiteUserRepository.mutations.updateUser(userId, req));

    return this.getUserById(userId);
  }

  async activateUser(userId: number) {
    await this.connection.query(SiteUserRepository.mutations.activateUser(userId));
  }

  async deactivateUser(userId: number) {
    await this.connection.query(SiteUserRepository.mutations.deactivateUser(userId));
  }

  async deleteUser(userId: number) {
    await this.connection.query(SiteUserRepository.mutations.deleteUser(userId));
  }

  async getPasswordReset(c1: string, c2: string) {
    const resetRow = await this.connection.one(SiteUserRepository.query.getPasswordReset(c2));

    if (!resetRow.shared_hash) {
      throw new Error('Invalid hash');
    }

    if (!(await phpHashCompare(c1, resetRow.shared_hash))) {
      throw new Error('Invalid hash');
    }

    return {
      userId: resetRow.user_id,
      created: new Date(resetRow.created),
      activate: resetRow.activate,
    };
  }

  async setUserPassword(c2: string, password: string) {
    const resetRow = await this.connection.one(SiteUserRepository.query.getPasswordReset(c2));

    const hash = await passwordHash(password);

    await this.connection.query(SiteUserRepository.mutations.setUserPassword(resetRow.user_id, hash));
    await this.connection.query(SiteUserRepository.mutations.removeResetPassword(c2));

    if (resetRow.activate) {
      await this.activateUser(resetRow.user_id);
    }
  }

  async resetUserPassword(id: string, hash: string, userId: number, activate: boolean) {
    await this.connection.query(SiteUserRepository.mutations.resetPassword(id, hash, userId, activate));
  }

  async getInvitations(siteId: number) {
    return (await this.connection.any(SiteUserRepository.query.getInvitations(siteId))).map(
      SiteUserRepository.mapInvitation
    );
  }

  async getInvitation(invitationId: string, siteId: number): Promise<UserInvitation> {
    return SiteUserRepository.mapInvitationWithUsers(
      await this.connection.any(SiteUserRepository.query.getInvitation(invitationId, siteId))
    );
  }

  async createInvitationRedemption(invitationId: string, userId: number, siteId: number) {
    const invitation = await this.getInvitation(invitationId, siteId);
    await this.connection.query(SiteUserRepository.mutations.createInvitationRedemption(invitation._id, userId));
    await this.connection.query(SiteUserRepository.mutations.useInvitation(invitationId, siteId));
  }

  async createInvitation(req: UserInvitationsRequest, siteId: number, userId: number) {
    await this.connection.query(SiteUserRepository.mutations.createInvitation(req, siteId, userId));

    return await this.getInvitation(req.invitation_id, siteId);
  }

  async deleteInvitation(invitationId: string, siteId: number) {
    await this.connection.query(SiteUserRepository.mutations.deleteInvitation(invitationId, siteId));
  }

  async changeSiteVisibility(siteId: number, isPublic: boolean) {
    await this.connection.query(SiteUserRepository.mutations.changeSiteVisibility(siteId, isPublic));
  }

  async deleteSite(siteId: number) {
    // Note - sites must first be made non-public before deleting.

    await this.connection.query(SiteUserRepository.mutations.deleteSite(siteId));
  }

  async createSite(req: CreateSiteRequest, userId: number, permissions: ExternalConfig['permissions']) {
    await this.connection.query(SiteUserRepository.mutations.createSite(req, userId));

    const site = await this.getSiteBySlug(req.slug);

    if (permissions) {
      await this.addJWTPermissionsToSite(site.id, permissions);
    }

    return site;
  }

  async addJWTPermissionsToSite(siteId: number, permissions: ExternalConfig['permissions']) {
    try {
      const perms: Array<[number, string, string]> = [];
      const roles = Object.keys(permissions);
      for (const role of roles) {
        for (const scope of permissions[role]) {
          perms.push([siteId, role, scope]);
        }
      }

      if (perms.length) {
        // JWT Site scopes.
        await this.connection.query(sql`
          INSERT INTO jwt_site_scopes (site_id, role, scope) SELECT * FROM ${sql.unnest(perms, [
            'int4',
            'text',
            'text',
          ])}
        `);
      }
    } catch (e) {
      // no-op
    }
  }

  async updateSite(siteId: number, req: Partial<UpdateSiteRequest>) {
    await this.connection.query(SiteUserRepository.mutations.updateSite(siteId, req));

    try {
      const site = await this.getSiteById(siteId);
      const cacheKey = `public-site-id:${site.slug}`;
      cache.put(cacheKey, site, 60 * 60 * 1000); // 1-hour cache.
    } catch (e) {
      //..
    }
  }

  async updateInvitation(invitationId: string, siteId: number, req: UpdateInvitation) {
    await this.connection.query(SiteUserRepository.mutations.updateInvitation(invitationId, siteId, req));

    return this.getInvitation(invitationId, siteId);
  }

  async getSiteStatistics(): Promise<{
    [id: number]: {
      projects?: number;
      collection?: number;
      manifest?: number;
      canvas?: number;
    };
  }> {
    const sites = await this.connection.any(sql<{ id: number }>`select id from site`);
    const resources = await this.connection.any(
      sql<{
        resource_type: string;
        site_id: number;
        total_items: number;
      }>`select resource_type, site_id, COUNT(*) as total_items from iiif_derived_resource where flat = false group by site_id, resource_type`
    );
    const projects = await this.connection.any(
      sql<{
        site_id: number;
        total_projects: number;
      }>`select site_id, COUNT(*) as total_projects from iiif_project group by site_id`
    );

    const siteMap: any = {};

    for (const site of sites) {
      siteMap[site.id] = {
        id: site.id,
      };
    }

    const stats = resources.reduce((map, next) => {
      if (map[next.site_id]) {
        map[next.site_id][next.resource_type] = next.total_items;
      }
      return map;
    }, siteMap);

    for (const project of projects) {
      if (stats[project.site_id]) {
        stats[project.site_id].projects = project.total_projects;
      }
    }

    return stats;
  }

  async getUserFromJwt(
    siteId: number,
    jwt?: { user?: { name: string; id?: number; service: boolean; serviceId?: string }; scope?: string[] }
  ): Promise<CurrentUserWithScope | undefined> {
    if (!jwt || !jwt.user || jwt.user.service || !jwt.scope || !jwt.user.id) {
      return undefined;
    }

    try {
      const user = await this.getSiteUserById(jwt.user.id, siteId);

      return {
        name: user.name,
        id: user.id,
        scope: jwt.scope,
        site_role: user.site_role,
        role: user.role,
      };
    } catch (e) {
      return undefined;
    }
  }

  async refreshExpiredToken(token: string, refreshWindow: number) {
    const response = verifySignedToken(token, true);
    if (!response) {
      throw new NotFound();
    }

    const userDetails = parseJWT(response);
    if (!userDetails || userDetails.user.service || !userDetails.user.id) {
      throw new NotFound();
    }

    const { payload } = response;

    const exp = payload.exp * 1000;
    const time = new Date().getTime();
    const allowedTime = time - refreshWindow * 1000;
    const canRefresh = exp - allowedTime > 0;
    const hasExpired = exp - time < 0;

    if (!hasExpired) {
      return { canRefresh: false, hasExpired: false, siteId: userDetails.site.id, details: null } as const;
    }

    if (!canRefresh) {
      return { canRefresh: false, hasExpired: true, siteId: userDetails.site.id, details: null } as const;
    }

    return {
      canRefresh: true,
      hasExpired: true,
      siteId: userDetails.site.id,
      details: await this.getUserAndSites(userDetails.user.id),
    } as const;
  }
}
