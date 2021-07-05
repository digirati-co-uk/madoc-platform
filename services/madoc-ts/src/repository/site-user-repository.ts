import cache from 'memory-cache';
import { DatabasePoolConnectionType, DatabaseTransactionConnectionType, NotFoundError, sql } from 'slonik';
import {
  LegacySiteRow,
  Site,
  SitePermissionRow,
  SiteRow,
  SiteUser,
  User,
  UserRow,
  UserRowWithoutPassword,
  UserSite,
} from '../extensions/site-manager/types';
import { mysql } from '../utility/mysql';
import { OmekaApi, PublicSite } from '../utility/omeka-api';
import { phpHashCompare } from '../utility/php-hash-compare';
import { SQL_EMPTY, SQL_INT_ARRAY } from '../utility/postgres-tags';
import { upsert } from '../utility/slonik-helpers';
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

    getUserById: (id: number) => sql<UserRowWithoutPassword>`
        select id, email, name, created, modified, role, is_active
        from "user"
        where id = ${id};
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
      where s.is_public = 1 or s.owner_id=${userId}
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
  };

  static mutations = {
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
      is_active: row.is_active,
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
    };
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

  async legacyOmekaDatabaseSync() {
    if (!this.shouldSync()) {
      console.log('Skipping sync...');
      return;
    }

    console.log('Starting sync...');

    const sites = (await this.omeka.listAllSites()).map(SiteUserRepository.compatibility.site);

    console.log(`=> Syncing ${sites.length} sites`);
    await this.connection.query(
      upsert('site', ['id'], sites, ['id', 'slug', 'title', 'summary', 'created', 'modified', 'is_public'], {
        dateKeys: ['created', 'modified'],
      })
    );

    const users = await this.omeka.listAllUsers();
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

    const sitePermissions = await this.omeka.listSitePermissions();
    console.log(`=> Syncing ${sitePermissions.length} site permissions`);
    await this.connection.query(
      upsert('site_permission', ['site_id', 'user_id'], sitePermissions, ['site_id', 'user_id', 'role'])
    );

    // @todo user_invitations table
    // @todo password_creation table

    console.log('Completed sync');
  }

  /**
   * This can return inactive users, use getActiveUserById() instead or check is_active
   * @throws NotFoundError
   */
  async getUserById(id: number) {
    if (this.shouldReadFromOmeka()) {
      return this.omeka.getUserById(id);
    } else {
      return this.connection.one(SiteUserRepository.query.getUserById(id));
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
    if (this.shouldReadFromOmeka()) {
      return this.omeka.getSiteUserById(id, siteId);
    } else {
      return this.connection.one(SiteUserRepository.query.getSiteUserById(id, siteId));
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

  async listAllSites() {
    if (this.shouldReadFromOmeka()) {
      return (await this.omeka.listAllSites()).map(SiteUserRepository.mapSite);
    } else {
      return (await this.connection.any(SiteUserRepository.query.listAllSites())).map(SiteUserRepository.mapSite);
    }
  }

  async getSiteUsers(siteId: number): Promise<SiteUser[]> {
    if (this.shouldReadFromOmeka()) {
      return await this.omeka.getSiteUsers(siteId);
    } else {
      throw new Error('Not implemented');
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
  async getCachedSiteIdBySlug(slug: string, userId: number, isAdmin = false): Promise<Site> {
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

    const authenticatedSites = await this.getAuthenticatedSites(userId);
    for (const authedSite of authenticatedSites) {
      if (authedSite.id === site.id) {
        return site;
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

  async getUserSites(userId: number, role: string) {
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

  async searchUser(query: string) {
    return this.connection.any(sql<UserRowWithoutPassword>`
        select u.id, u.email, u.name, u.role from "user" as u 
          where u.is_active = true 
          and (
            u.email ilike ${'%' + query + '%'} or u.name ilike ${'%' + query + '%'}
          )
          limit 20
    `);
  }

  // @todo Areas to migrate Omeka functionality:
  //   - Register [+]
  //   - Reset password [+]
  //   - Email activation [+]
  //   - User invitations [+]
  //   - Delete users [+]
  //   - Autocomplete/browse [+]
}
