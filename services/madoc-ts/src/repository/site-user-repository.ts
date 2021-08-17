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
import { OmekaApi } from '../utility/omeka-api';
import { phpHashCompare } from '../utility/php-hash-compare';
import { passwordHash } from '../utility/php-password-hash';
import { SQL_COMMA, SQL_EMPTY, SQL_INT_ARRAY } from '../utility/postgres-tags';
import { sqlDate, upsert } from '../utility/slonik-helpers';
import { BaseRepository } from './base-repository';

/**
 * Site + User repository.
 *
 * Soon Madoc will transition from the Omeka MySQL database to a purely
 * postgres-driven database.
 *
 * In order for this to be as smooth as possible, this repository will act as the
 * adapter where all code currently relying on the Omeka database will flow through
 * here instead.
 *
 * A write-only clone of the data will be created and synced when starting up. This
 * syncing process will only eventually only exist if a MySQL database is detected.
 * For 2.0 stable, this will be removed.
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

type OmekaTransitionModes =
  // Write to Omeka, read from Omeka
  | 'FULL_OMEKA'
  // Write to Omeka + Postgres, read from Omeka
  | 'HYBRID_OMEKA'
  // Write to Omeka + Postgres, read from Postgres
  | 'HYBRID_POSTGRES'
  // Write to Postgres, read from Postgres
  | 'FULL_POSTGRES';

export class SiteUserRepository extends BaseRepository {
  omeka: OmekaApi;
  transitionMode: OmekaTransitionModes;

  constructor(
    postgres: DatabasePoolConnectionType | DatabaseTransactionConnectionType,
    omeka: OmekaApi,
    transitionMode: OmekaTransitionModes
  ) {
    super(postgres);
    this.omeka = omeka;
    this.transitionMode = transitionMode;
  }

  static query = {
    // ==============================
    // Sites
    // ==============================

    listAllSites: () => sql<SiteRow>`
        select site.*, u.name as owner_name
        from site
           left join "user" u on site.owner_id = u.id
    `,

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
      select id, email, name, created, modified, role, is_active
        from "user" limit ${perPage} offset ${(page - 1) * perPage};
    `,

    getUserById: (id: number) => sql<UserRowWithoutPassword>`
        select id, email, name, created, modified, role, is_active
        from "user"
        where id = ${id};
    `,

    getUserByEmail: (email: string) => sql<UserRowWithoutPassword>`
        select id, email, name, created, modified, role, is_active
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
          select u.id, u.name, u.role, sp.role as site_role
          from "user" u
                   left join site_permission sp on u.id = sp.user_id
          where sp.site_id = ${siteId}
            and u.is_active = true
            and (
              sp.role = ANY (${sql.array(roles, SQL_INT_ARRAY)}) 
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
      select id, name, email, role, is_active, created, modified 
      from "user" 
      where is_active = true and id = ${userId}
    `,

    getActiveUserByEmail: (email: string) => sql<UserRow>`
      select id, name, email, created, modified, password_hash, role, is_active 
      from "user" 
      where is_active = true and email = ${email}
    `,

    getSiteUsers: (siteId: number) => sql<SiteUser>`
      select u.id, u.name, u.role, sp.role as site_role from "user" u
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
        where sp.role is not null 
          ${q ? sql`and (u.email ilike ${query} or u.name ilike ${query})` : SQL_EMPTY}  
          and sp.site_id = ${siteId} 
          ${roles.length ? sql`and sp.role = ANY(${sql.array(roles, 'text')})` : SQL_EMPTY}
        group by u.id, sp.user_id, sp.role limit 50
      `;
    },

    searchAllUsers: (q: string) => sql<UserRowWithoutPassword>`
      select u.id, u.email, u.name, u.role from "user" as u
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
      select ui.*, uir.user_id as redeem_user_id, u.name as redeem_user_name, u.email as redeem_user_email, uir.redeemed_at as redeem_redeemed_at from user_invitations ui
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
      update "user" set password_hash = ${hash} where id = ${userId}
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
      insert into "user" (id, email, name, is_active, role, password_hash) values (
        ${id},
        ${user.email},
        ${user.name},
        false,
        ${user.role},
        null
       ) returning *
    `,

    createUser: (user: UserCreationRequest) => sql<UserRow>`
      insert into "user" (email, name, is_active, role, password_hash) values (
        ${user.email},
        ${user.name},
        false,
        ${user.role},
        null
       ) returning *
    `,

    setUserPassword: (userId: number, hash: string) => sql`
      update "user" set password_hash = ${hash} where id = ${userId}
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
      update "user" set is_active = false where id = ${userId}
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
        setValues.push(sql`email = ${req.email}`);
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

  shouldSync() {
    return this.transitionMode !== 'FULL_POSTGRES';
  }

  shouldWriteToOmeka() {
    return this.transitionMode !== 'FULL_POSTGRES';
  }

  shouldWriteToPostgres() {
    return this.transitionMode !== 'FULL_OMEKA';
  }

  shouldReadFromOmeka() {
    return this.transitionMode === 'FULL_OMEKA' || this.transitionMode === 'HYBRID_OMEKA';
  }

  shouldReadFromPostgres() {
    return this.transitionMode === 'FULL_POSTGRES' || this.transitionMode === 'HYBRID_POSTGRES';
  }

  static mapUser(row: UserRowWithoutPassword | UserRow): User {
    return {
      id: row.id,
      email: row.email,
      role: row.role,
      name: row.name,
      created: new Date(row.created),
      modified: row.modified ? new Date(row.modified) : undefined,
      is_active: Boolean(row.is_active),
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
        ...(row.config || {}),
      },
    } as Site;
  }

  static mapInvitation(row: UserInvitationsRow): UserInvitation {
    return {
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

  async legacyOmekaDatabaseSync(permissions: ExternalConfig['permissions']) {
    if (!this.shouldSync()) {
      console.log('Skipping sync...');
      return;
    }

    console.log('Starting sync...');

    const sites = (await this.omeka.listAllSites()).map(SiteUserRepository.compatibility.site);
    if (sites.length) {
      for (const site of sites) {
        if (!site.created) {
          site.created = new Date();
        }
        if (!site.modified) {
          site.modified = site.created;
        }
      }
      console.log(`=> Syncing ${sites.length} sites`);
      await this.connection.query(
        upsert('site', ['id'], sites, ['id', 'slug', 'title', 'summary', 'created', 'modified', 'is_public'], {
          dateKeys: ['created', 'modified'],
        })
      );

      for (const site of sites) {
        const { rowCount } = await this.connection.query(
          sql`SELECT id FROM jwt_site_scopes WHERE site_id = ${site.id}`
        );
        if (rowCount === 0) {
          console.log(`=> Adding missing permissions to site ${site.title}`);
          await this.addJWTPermissionsToSite(site.id, permissions);
        }
      }

      await this.connection.query(sql`select setval('site_id_seq', (select max(id) from site));`);
    }

    const users = await this.omeka.listAllUsers();
    if (users.length) {
      console.log(`=> Syncing ${users.length} users`);
      await this.connection.query(
        upsert(
          'user',
          ['id'],
          users,
          ['id', 'email', 'name', 'created', 'modified', 'password_hash', 'role', 'is_active'],
          {
            dateKeys: ['created', 'modified'],
          }
        )
      );

      await this.connection.query(sql`select setval('user_id_seq', (select max(id) from "user"));`);
    }

    const sitePermissions = await this.omeka.listSitePermissions();
    if (sitePermissions.length) {
      console.log(`=> Syncing ${sitePermissions.length} site permissions`);
      await this.connection.query(
        upsert('site_permission', ['site_id', 'user_id'], sitePermissions, ['site_id', 'user_id', 'role'])
      );
    }

    console.log('Completed sync');
  }

  async getSystemConfig(cached = true): Promise<SystemConfig> {
    const cacheKey = `madoc-system-config`;
    const cachedConfig = cache.get(cacheKey) as SystemConfig;
    if (cachedConfig && cached) {
      return cachedConfig;
    }

    const defaultConfig: SystemConfig = {
      installationTitle: 'Madoc',
      enableRegistrations: true,
      enableNotifications: true,
      emailActivation: true,
      defaultSite: null,
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
    if (this.shouldReadFromOmeka()) {
      return SiteUserRepository.mapUser(await this.omeka.getUserById(id));
    } else {
      return SiteUserRepository.mapUser(await this.connection.one(SiteUserRepository.query.getUserById(id)));
    }
  }

  /**
   * This can return inactive users, use getActiveUserById() instead or check is_active
   * @throws NotFoundError
   */
  async getUserByEmail(email: string) {
    if (this.shouldReadFromOmeka()) {
      return this.omeka.getUserByEmail(email);
    } else {
      return this.connection.one(SiteUserRepository.query.getUserByEmail(email));
    }
  }

  async userEmailExists(email: string) {
    try {
      await this.getUserByEmail(email);
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
    if (this.shouldReadFromOmeka()) {
      return SiteUserRepository.mapUser(await this.omeka.getActiveUserById(id));
    } else {
      return SiteUserRepository.mapUser(await this.connection.one(SiteUserRepository.query.getActiveUserById(id)));
    }
  }

  /**
   * @throws NotFoundError
   */
  private async getActiveUserByEmailWithPassword(email: string): Promise<UserRow> {
    if (this.shouldReadFromOmeka()) {
      return this.omeka.getActiveUserByEmailWithPassword(email);
    } else {
      return this.connection.one(SiteUserRepository.query.getActiveUserByEmail(email));
    }
  }

  /**
   * @throws NotFoundError
   */
  async getSiteUserById(id: number, siteId: number): Promise<SiteUser> {
    try {
      if (this.shouldReadFromOmeka()) {
        return await this.omeka.getSiteUserById(id, siteId);
      } else {
        return await this.connection.one(SiteUserRepository.query.getSiteUserById(id, siteId));
      }
    } catch (e) {
      const user = await this.getActiveUserById(id);
      if (user.role === 'global_admin') {
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          site_role: 'admin',
          name: user.name,
        };
      }

      const site = await this.getSiteById(siteId);
      if (!site.is_public) {
        throw new NotFoundError();
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        site_role: 'viewer',
        name: user.name,
      };
    }
  }

  /**
   * @throws NotFoundError
   */
  async getSiteCreator(siteId: number) {
    if (this.shouldReadFromOmeka()) {
      return this.omeka.getSiteCreator(siteId);
    } else {
      return this.connection.one(SiteUserRepository.query.getSiteCreator(siteId));
    }
  }

  async getUsersByRoles(siteId: number, roles: string[], includeAdmins = true) {
    if (this.shouldReadFromOmeka()) {
      return this.omeka.getUsersByRoles(siteId, roles, includeAdmins);
    } else {
      return this.connection.any(SiteUserRepository.query.getUsersByRoles(siteId, roles, includeAdmins));
    }
  }

  async searchUsers(q: string, siteId: number, roles: string[] = []) {
    if (!q && !roles.length) {
      return [];
    }

    if (this.shouldReadFromOmeka()) {
      return this.omeka.searchUsers(q, siteId, roles);
    } else {
      return this.connection.any(SiteUserRepository.query.searchUsers(q, siteId, roles));
    }
  }

  async searchAllUsers(q: string) {
    if (this.shouldReadFromOmeka()) {
      return this.omeka.searchAllUsers(q);
    } else {
      return this.connection.any(SiteUserRepository.query.searchAllUsers(q));
    }
  }

  async listAllSites() {
    if (this.shouldReadFromOmeka()) {
      return (await this.omeka.listAllSites()).map(SiteUserRepository.mapSite);
    } else {
      return (await this.connection.any(SiteUserRepository.query.listAllSites())).map(SiteUserRepository.mapSite);
    }
  }

  async getSiteUsers(siteId: number): Promise<readonly SiteUser[]> {
    if (this.shouldReadFromOmeka()) {
      return await this.omeka.getSiteUsers(siteId);
    } else {
      return await this.connection.any(SiteUserRepository.query.getSiteUsers(siteId));
    }
  }

  /**
   * @throws NotFoundError
   */
  async getSiteById(id: number): Promise<Site> {
    if (this.shouldReadFromOmeka()) {
      return SiteUserRepository.mapSite(await this.omeka.getSite(id));
    } else {
      return SiteUserRepository.mapSite(await this.connection.one(SiteUserRepository.query.getSiteById(id)));
    }
  }

  /**
   * @throws NotFoundError
   */
  async getSiteBySlug(slug: string): Promise<Site> {
    if (this.shouldReadFromOmeka()) {
      return SiteUserRepository.mapSite(await this.omeka.getSiteBySlug(slug));
    } else {
      return SiteUserRepository.mapSite(await this.connection.one(SiteUserRepository.query.getSiteBySlug(slug)));
    }
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

    throw new NotFoundError();
  }

  async getAuthenticatedSites(userId: number): Promise<readonly UserSite[]> {
    if (this.shouldReadFromOmeka()) {
      return await this.omeka.getAuthenticatedSites(userId);
    } else {
      return await this.connection.any(SiteUserRepository.query.getAuthenticatedSites(userId));
    }
  }

  async getPublicSites(userId: number): Promise<readonly UserSite[]> {
    if (this.shouldReadFromOmeka()) {
      return await this.omeka.getPublicSites(userId);
    } else {
      return await this.connection.any(SiteUserRepository.query.getPublicSites(userId));
    }
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
    if (this.shouldReadFromOmeka()) {
      const resp = await this.omeka.countAllUsers();
      return resp.total_users;
    } else {
      const resp = await this.connection.one(SiteUserRepository.query.countAllUsers());
      return resp.total_users;
    }
  }

  async getAllUsers(page: number, perPage = 50) {
    if (this.shouldReadFromOmeka()) {
      return (await this.omeka.getAllUsers(page || 1, perPage)).map(SiteUserRepository.mapUser);
    } else {
      return (await this.connection.many(SiteUserRepository.query.getAllUsers(page || 1, perPage))).map(
        SiteUserRepository.mapUser
      );
    }
  }

  /**
   * @throws NotFoundError
   */
  async verifyLogin(email: string, password: string): Promise<{ user: User; sites: UserSite[] } | undefined> {
    const user = await this.getActiveUserByEmailWithPassword(email);

    if (!user || !password || !user.password_hash) {
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

  async updateUserPassword(userId: number, password: string) {
    const hash = await passwordHash(password);

    if (this.shouldWriteToOmeka()) {
      await this.omeka.updateUserPassword(userId, hash);
    }

    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.updateUserPassword(userId, hash));
    }
  }

  async setUsersRoleOnSite(siteId: number, userId: number, role: string) {
    if (this.shouldWriteToOmeka()) {
      await this.omeka.setUsersRoleOnSite(siteId, userId, role);
    }
    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.setUsersRoleOnSite(siteId, userId, role));
    }
  }

  async removeUserRoleOnSite(siteId: number, userId: number) {
    if (this.shouldWriteToOmeka()) {
      await this.omeka.removeUserRoleOnSite(siteId, userId);
    }

    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.removeUserRoleOnSite(siteId, userId));
    }
  }

  async createUser(user: UserCreationRequest) {
    if (this.shouldWriteToOmeka()) {
      await this.omeka.createUser(user);

      // In this case we need to use the ID we got from Omeka as the canonical ID.
      // Once we migrate this shouldn't be a problem.
      if (this.shouldWriteToPostgres()) {
        const omekaUser = await this.omeka.getUserByEmail(user.email);

        // So we force the ID from Omeka to be used.
        await this.connection.query(SiteUserRepository.mutations.createUserWithId(omekaUser.id, user));

        // We also need to reset the seq.
        await this.connection.query(sql`select setval('user_id_seq', (select max(id) from "user"));`);
      }
    } else {
      if (this.shouldWriteToPostgres()) {
        await this.connection.query(SiteUserRepository.mutations.createUser(user));
      }
    }

    return this.getUserByEmail(user.email);
  }

  async updateUser(userId: number, req: UpdateUser) {
    if (this.shouldWriteToOmeka()) {
      await this.omeka.updateUser(userId, req);
    }

    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.updateUser(userId, req));
    }

    return this.getUserById(userId);
  }

  async activateUser(userId: number) {
    if (this.shouldWriteToOmeka()) {
      await this.omeka.activateUser(userId);
    }

    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.activateUser(userId));
    }
  }

  async deactivateUser(userId: number) {
    if (this.shouldWriteToOmeka()) {
      await this.omeka.deactivateUser(userId);
    }

    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.deactivateUser(userId));
    }
  }

  async deleteUser(userId: number) {
    if (this.shouldWriteToOmeka()) {
      await this.omeka.deleteUser(userId);
    }

    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.deleteUser(userId));
    }
  }

  async getPasswordReset(c1: string, c2: string) {
    if (!this.shouldWriteToPostgres()) {
      throw new Error('Not enabled');
    }

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

    if (this.shouldWriteToOmeka()) {
      await this.omeka.setUserPassword(resetRow.user_id, hash);
    }

    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.setUserPassword(resetRow.user_id, hash));
      await this.connection.query(SiteUserRepository.mutations.removeResetPassword(c2));
    }

    if (resetRow.activate) {
      await this.activateUser(resetRow.user_id);
    }
  }

  async resetUserPassword(id: string, hash: string, userId: number, activate: boolean) {
    // Only used postgres for resetting password.
    // if (this.shouldWriteToOmeka()) {
    //   await this.omeka.resetPassword(id, userId, activate);
    // }

    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.resetPassword(id, hash, userId, activate));
    }
  }

  async getInvitations(siteId: number) {
    if (this.shouldReadFromOmeka()) {
      return (await this.omeka.getInvitations(siteId)).map(SiteUserRepository.mapInvitation);
    }

    if (this.shouldReadFromPostgres()) {
      return (await this.connection.any(SiteUserRepository.query.getInvitations(siteId))).map(
        SiteUserRepository.mapInvitation
      );
    }
  }

  async getInvitation(invitationId: string, siteId: number): Promise<UserInvitation> {
    if (this.shouldReadFromOmeka()) {
      return SiteUserRepository.mapInvitation(await this.omeka.getInvitation(invitationId, siteId));
    }

    if (this.shouldReadFromPostgres()) {
      return SiteUserRepository.mapInvitationWithUsers(
        await this.connection.any(SiteUserRepository.query.getInvitation(invitationId, siteId))
      );
    }

    throw new Error();
  }

  async createInvitationRedemption(invitationId: string, userId: number, siteId: number) {
    if (this.shouldWriteToPostgres()) {
      const invitation = await this.connection.one(SiteUserRepository.query.getInvitation(invitationId, siteId));
      await this.connection.query(SiteUserRepository.mutations.createInvitationRedemption(invitation.id, userId));
      await this.connection.query(SiteUserRepository.mutations.useInvitation(invitationId, siteId));
    }
  }

  async createInvitation(req: UserInvitationsRequest, siteId: number, userId: number) {
    if (this.shouldWriteToOmeka()) {
      await this.omeka.createInvitation(req, siteId, userId);
    }

    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.createInvitation(req, siteId, userId));
    }

    return await this.getInvitation(req.invitation_id, siteId);
  }

  async deleteInvitation(invitationId: string, siteId: number) {
    if (this.shouldWriteToOmeka()) {
      await this.omeka.deleteInvitation(invitationId, siteId);
    }

    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.deleteInvitation(invitationId, siteId));
    }
  }

  async changeSiteVisibility(siteId: number, isPublic: boolean) {
    if (this.shouldWriteToOmeka()) {
      await this.omeka.changeSiteVisibility(siteId, isPublic);
    }

    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.changeSiteVisibility(siteId, isPublic));
    }
  }

  async deleteSite(siteId: number) {
    // Note - sites must first be made non-public before deleting.
    if (this.shouldWriteToOmeka()) {
      await this.omeka.deleteSite(siteId);
    }

    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.deleteSite(siteId));
    }
  }

  async createSite(req: CreateSiteRequest, userId: number, permissions: ExternalConfig['permissions']) {
    if (this.shouldWriteToOmeka()) {
      await this.omeka.createSite(req, userId);
    }

    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.createSite(req, userId));
    }

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
    if (this.shouldWriteToOmeka()) {
      await this.omeka.updateSite(siteId, req);
    }

    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.updateSite(siteId, req));
    }

    try {
      const site = await this.getSiteById(siteId);
      const cacheKey = `public-site-id:${site.slug}`;
      cache.put(cacheKey, site, 60 * 60 * 1000); // 1-hour cache.
    } catch (e) {
      //..
    }
  }

  async updateInvitation(invitationId: string, siteId: number, req: UpdateInvitation) {
    if (this.shouldWriteToOmeka()) {
      await this.omeka.updateInvitation(invitationId, siteId, req);
    }

    if (this.shouldWriteToPostgres()) {
      await this.connection.query(SiteUserRepository.mutations.updateInvitation(invitationId, siteId, req));
    }

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
      }>`select resource_type, site_id, COUNT(*) as total_items from iiif_derived_resource group by site_id, resource_type`
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
      map[next.site_id][next.resource_type] = next.total_items;
      return map;
    }, siteMap);

    for (const project of projects) {
      stats[project.site_id].projects = project.total_projects;
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

  // @todo Areas to migrate Omeka functionality:
  //   - Autocomplete/browse [+]
}
