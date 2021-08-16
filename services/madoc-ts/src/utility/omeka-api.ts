import { Connection, Pool, PoolConnection, Query } from 'mysql';
import { NotFoundError, sql } from 'slonik';
import {
  CreateSiteRequest,
  LegacySitePermissionRow,
  LegacySiteRow,
  LegacyUserRow,
  SiteUser,
  UserCreationRequest,
  UserInvitationsRow,
  UserRow,
  UserRowWithoutPassword,
  UserSite,
} from '../extensions/site-manager/types';
import { mysql, raw } from './mysql';
import { Resource, ResourceItem, ResourceItemSet, ResourceMedia } from '../types/omeka/Resource';
import { Value } from '../types/omeka/Value';
import { phpHashCompare } from './php-hash-compare';
import { User } from '../types/omeka/User';
import { entity, MediaValue, VirtualMedia } from './field-value';
import { Media } from '../types/omeka/Media';
import { writeFileSync } from 'fs';
import mkdirp from 'mkdirp';
import cache from 'memory-cache';

export type PublicSite = { id: number; slug: string; title: string; is_public: number };

const fileDirectory = process.env.OMEKA_FILE_DIRECTORY || '/home/node/app/omeka-files';

export class OmekaApi {
  constructor(private connection: Pool) {}

  static getFileDirectory(file: string) {
    return `${fileDirectory}/original${file}`;
  }

  private async getTerms<T extends string>(terms: T[]): Promise<{ [term in T]: { id: number; term: string } }> {
    const dbTerms = await this.many<{ id: number; term: string }>(mysql`
      SELECT property.id, CONCAT(v.prefix, ':', local_name) AS term 
      FROM property 
          LEFT JOIN vocabulary v ON property.vocabulary_id = v.id 
      WHERE CONCAT(v.prefix, ':', local_name) IN (${terms})
    `);

    const termMap: any = {};

    for (const term of dbTerms) {
      termMap[term.term] = term;
    }

    return termMap;
  }

  /**
   * @deprecated
   * @internal
   */
  async updateItem(
    id: number,
    document: { [term: string]: Array<Partial<Value> | Omit<MediaValue, 'property_id'>> },
    owner_id: number
  ) {
    const terms = Object.keys(document);
    const properties = await this.getTerms(terms);
    const fields = [];
    for (const term of terms) {
      const property = properties[term];
      // Skip not found properties.
      if (!property) continue;
      // Push field.
      const values = document[term];
      for (const value of values) {
        fields.push({
          ...value,
          is_public: 1,
          property_id: property.id,
        } as Value);
      }
    }

    await this.one(
      mysql`
        INSERT INTO value (resource_id, property_id, value_resource_id, type, lang, value, uri, is_public) VALUES 
          ${raw(
            fields
              .map(value => {
                return mysql`(${id}, ${value.property_id}, ${value.value_resource_id}, ${value.type}, ${value.lang}, ${value.value}, ${value.uri}, ${value.is_public})`;
              })
              .join(',')
          )};
      `
    );
  }

  /**
   * @deprecated
   * @internal
   */
  async addToItemSet(id: number, ids: number[]) {
    if (ids.length === 0) {
      return;
    }

    await this.one(mysql`
        INSERT INTO item_item_set (item_id, item_set_id) VALUES ${raw(
          ids.map(itemId => mysql`(${itemId}, ${id})`).join(',')
        )}
    `);
  }

  /**
   * @deprecated
   * @internal
   */
  async createItemFromTemplate(
    templateName: string,
    resourceType: Resource['resource_type'],
    document: {
      [term: string]:
        | Array<Partial<Value> | Omit<MediaValue, 'property_id'> | Omit<VirtualMedia, 'property_id'> | undefined>
        | undefined;
    },
    ownerId: number
  ) {
    const terms = Object.keys(document);
    const [properties, template] = await Promise.all([this.getTerms(terms), this.getTemplate(templateName)]);

    const fields: Value[] = [];
    const media: Array<MediaValue | VirtualMedia> = [];
    for (const term of terms) {
      const property = properties[term];
      // Skip not found properties.
      if (!property) continue;
      // Push field.
      const values = document[term];
      if (!values) {
        continue;
      }
      for (const value of values) {
        if (!value) {
          continue;
        }
        if (value.type === 'media') {
          media.push({
            ...value,
            property_id: property.id,
          });
          continue;
        }
        if (value.type === 'virtual') {
          media.push({
            ...value,
            property_id: property.id,
          });
        }

        fields.push({
          ...value,
          is_public: 1,
          property_id: property.id,
        } as Value);
      }
    }

    return this.createResource({
      resource: {
        created: new Date(),
        is_public: 1,
        resource_type: resourceType,
        owner_id: ownerId,
        resource_class_id: template.class_id,
        resource_template_id: template.template_id,
      },
      values: fields,
      attachedMedia: media,
    });
  }

  /**
   * @deprecated
   * @internal
   */
  async getTemplate(
    name: string
  ): Promise<{
    template_id: number;
    class_id: number;
  }> {
    const { template_id, class_id } = await this.one(mysql`
      SELECT t.id as template_id, rc.id as class_id from resource_template t LEFT JOIN resource_class rc on t.resource_class_id = rc.id WHERE t.label = ${name}
    `);

    return {
      template_id,
      class_id,
    };
  }

  /**
   * @deprecated
   * @internal
   */
  async getSiteLabelById(siteId?: number) {
    if (!siteId) {
      return;
    }
    const site = await this.one<{ label: string }>(mysql`select title from site where id = ${siteId}`);

    return site.label;
  }

  /**
   * @deprecated use context.siteManager.getUserById() instead
   */
  async getSiteUserById(id: number, siteId: number) {
    return this.one<SiteUser>(mysql`
        select u.id, u.name, u.role, sp.role as site_role from user u
          left join site_permission sp on u.id = sp.user_id
          where sp.site_id = ${siteId} and u.id = ${id}
    `);
  }

  /**
   * @deprecated use context.siteManager.getSiteCreator() instead
   */
  async getSiteCreator(siteId: number) {
    return this.one<SiteUser>(
      mysql`select u.id, u.name, u.role from user u left join site s on u.id = s.owner_id where s.id = ${siteId}`
    );
  }

  /**
   * @deprecated use context.siteManager.getUsersByRoles() instead
   */
  async getUsersByRoles(siteId: number, roles: string[], includeAdmins = true) {
    const adminQuery = includeAdmins ? raw(` or sp.role = "admin"`) : mysql``;

    return await this.many<SiteUser>(mysql`
      select u.id, u.name, u.role, sp.role as site_role from user u
          left join site_permission sp on u.id = sp.user_id
          where sp.site_id = ${siteId} and (sp.role IN (${roles})${adminQuery})
    `);
  }

  /**
   * @deprecated use context.siteManager.listAllSites() instead
   */
  async listAllSites() {
    return await this.many<LegacySiteRow>(
      mysql`
        select * from site s
      `
    );
  }

  async getSiteUsers(siteId: number): Promise<SiteUser[]> {
    return await this.many<SiteUser>(
      mysql`
        select u.id, u.name, u.role, sp.role as site_role, u.email from user u
           left join site_permission sp on u.id = sp.user_id
        where sp.site_id = ${siteId}
      `
    );
  }

  /**
   * @internal
   * @deprecated This should only be used for migration
   */
  async listAllUsers() {
    return await this.many<LegacyUserRow>(
      mysql`
        SELECT * from user
      `
    );
  }

  /**
   * @internal
   * @deprecated This should only be used for migration
   */
  async listSitePermissions() {
    return await this.many<LegacySitePermissionRow>(
      mysql`
        SELECT * from site_permission
      `
    );
  }

  async getAuthenticatedSites(userId: number) {
    return await this.many<UserSite>(mysql`
      SELECT s.id, sp.role, s.slug, s.title FROM site_permission sp LEFT JOIN site s on sp.site_id = s.id WHERE user_id=${userId}
    `);
  }

  async getPublicSites(userId: number) {
    return await this.many<UserSite>(
      mysql`
        SELECT s.id, s.slug, s.title, 'viewer' as role from site s where s.is_public = 1 or s.owner_id=${userId}
      `
    );
  }

  /**
   * @deprecated use context.siteManager.getUserSites() instead
   */
  async getUserSites(userId: number, role: string): Promise<UserSite[]> {
    if (role && role === 'global_admin') {
      const sites = await this.many<UserSite>(mysql`SELECT s.id, s.slug, s.title FROM site s`);
      return sites.map(s => ({ ...s, role: 'admin' }));
    }

    const userSiteSlugs: string[] = [];
    const userSites: UserSite[] = [];

    try {
      const authedSites = await this.many<UserSite>(mysql`
        SELECT s.id, sp.role, s.slug, s.title FROM site_permission sp LEFT JOIN site s on sp.site_id = s.id WHERE user_id=${userId}
      `);

      userSiteSlugs.push(...authedSites.map(s => s.slug));
      userSites.push(...authedSites);
    } catch (err) {
      // no-op
    }

    const publicSites = await this.many<UserSite>(
      mysql`
        SELECT s.id, s.slug, s.title, 'viewer' as role from site s where s.is_public = 1 or s.owner_id=${userId}
      `
    );

    for (const publicSite of publicSites) {
      if (userSiteSlugs.indexOf(publicSite.slug) === -1) {
        userSites.push(publicSite);
      }
    }

    return userSites;
  }

  /**
   * @internal
   */
  async getUserById(id: number) {
    return await this.one<UserRowWithoutPassword>(
      mysql`SELECT id, name, email, role, is_active, created, modified FROM user WHERE id = ${id}`
    );
  }

  /**
   * @internal
   */
  async getUserByEmail(email: string) {
    return await this.one<UserRowWithoutPassword>(
      mysql`SELECT id, name, email, role, is_active, created, modified FROM user WHERE email = ${email}`
    );
  }

  /**
   * @internal
   */
  async activateUser(userId: number) {
    await this.query(mysql`update user set is_active = true where id = ${userId}`);
  }

  /**
   * @internal
   */
  async deactivateUser(userId: number) {
    await this.query(mysql`update user set is_active = false where id = ${userId}`);
  }

  /**
   * @internal
   */
  async deleteUser(userId: number) {
    await this.query(mysql`delete from user where id = ${userId} and is_active = false`);
  }

  /**
   * @internal
   */
  async getActiveUserById(id: number) {
    return await this.one<UserRowWithoutPassword>(
      mysql`SELECT id, name, email, role, is_active, created, modified FROM user WHERE is_active = 1 AND id = ${id}`
    );
  }

  /**
   * @internal
   */
  async resetPassword(id: string, userId: number, activate: boolean) {
    await this.query(mysql`
      insert into password_creation (id, user_id, activate) values (${id}, ${userId}, ${activate ? 1 : 0})
    `);
  }

  /**
   * @internal
   */
  async getInvitations(siteId: number) {
    return this.many<UserInvitationsRow>(mysql`select * from user_invitations where site_id = ${siteId}`);
  }

  /**
   * @internal
   */
  async getInvitation(invitationId: string, siteId: number) {
    return this.one<UserInvitationsRow>(
      mysql`select * from user_invitations where invitation_id = ${invitationId} and site_id = ${siteId}`
    );
  }

  /**
   * @internal
   */
  async deleteInvitation(invitationId: string, siteId: number) {
    await this.query(mysql`
      delete from user_invitations where invitation_id = ${invitationId} and site_id = ${siteId}
    `);
  }

  /**
   * @deprecated use context.siteManager.getUserAndSites() instead
   * @internal
   */
  async getUser(id: number) {
    const user = await this.getActiveUserById(id);

    if (!user) {
      return undefined;
    }

    const sites = await this.getUserSites(user.id, user.role);
    return { user, sites };
  }

  async getActiveUserByEmailWithPassword(email: string) {
    return await this.one<UserRow>(
      mysql`SELECT id, name, email, created, modified, password_hash, role, is_active FROM user WHERE is_active = 1 AND email = ${email}`
    );
  }

  /**
   * @deprecated use context.siteManager.verifyLogin() instead
   * @internal
   */
  async verifyLogin(email: string, password: string) {
    const user = await this.one<User>(
      mysql`SELECT id, name, email, password_hash, role FROM user WHERE is_active = 1 AND email = ${email}`
    );

    if (!user || !password || !user.password_hash) {
      return undefined;
    }

    if (await phpHashCompare(password, user.password_hash)) {
      const sites = await this.getUserSites(user.id, user.role);
      return { user, sites };
    }
  }

  /**
   * @deprecated
   * @internal
   */
  async addFieldsToItem(connection: PoolConnection, id: number, values: Array<Omit<Value, 'id'>>) {
    await this.one(
      mysql`
        INSERT INTO value (resource_id, property_id, value_resource_id, type, lang, value, uri, is_public) VALUES 
          ${raw(
            values
              .map(value => {
                return mysql`(${id}, ${value.property_id}, ${value.value_resource_id}, ${value.type}, ${value.lang}, ${value.value}, ${value.uri}, ${value.is_public})`;
              })
              .join(',')
          )};
      `,
      connection
    );
  }

  /**
   * @deprecated
   * @internal
   */
  async createResourceItem(
    connection: PoolConnection,
    { resource, mediaType }: { resource: Omit<Resource, 'id'>; mediaType?: Omit<Media, 'id'> }
  ) {
    await this.one(
      mysql`
        INSERT INTO resource (owner_id, resource_class_id, resource_template_id, is_public, created, resource_type, thumbnail_id) VALUES (${[
          resource.owner_id,
          resource.resource_class_id,
          resource.resource_template_id,
          resource.is_public,
          resource.created,
          resource.resource_type,
          resource.thumbnail_id,
        ]});
      `,
      connection
    );

    const item = await this.one<Resource>(mysql`SELECT * FROM resource WHERE id = LAST_INSERT_ID()`, connection);
    if (resource.resource_type === ResourceItem) {
      await this.one(
        mysql`
          INSERT INTO item (id) VALUES (${item.id});
        `,
        connection
      );
    } else if (resource.resource_type === ResourceItemSet) {
      await this.one(
        mysql`
          INSERT INTO item_set (id, is_open) VALUES (${item.id}, 1);
        `,
        connection
      );
    } else if (resource.resource_type === ResourceMedia && mediaType) {
      await this.one(
        mysql`
          INSERT INTO media (id, item_id, ingester, renderer, data, source, media_type, storage_id, extension,
                               sha256, has_original, has_thumbnails, position, lang, size)
          VALUES (
            ${item.id}, ${mediaType.item_id}, ${mediaType.ingester}, ${mediaType.renderer}, ${mediaType.data},
            ${mediaType.source}, ${mediaType.media_type}, ${mediaType.storage_id}, ${mediaType.extension},
            ${mediaType.sha256}, ${mediaType.has_original}, ${mediaType.has_thumbnails}, ${mediaType.position},
            ${mediaType.lang}, ${mediaType.size}
          )
        `,
        connection
      );
    }

    return item;
  }

  /**
   * @deprecated
   * @internal
   */
  async getTransaction<R>(callback: (connection: PoolConnection) => Promise<R>) {
    return new Promise<R>((resolve, reject) => {
      this.connection.getConnection((cErr, connection) => {
        if (cErr) {
          reject(cErr);
        }
        connection.beginTransaction(async tErr => {
          if (tErr) {
            reject(tErr);
          }
          try {
            resolve(await callback(connection));
          } catch (err) {
            connection.rollback(() => {
              connection.release();
              reject(err);
            });
          }
        });
      });
    });
  }

  /**
   * @deprecated
   * @internal
   */
  async getCollectionById(id: number, siteId: number, connection?: PoolConnection) {
    return this.one<{ id: number; label: string; count: number }>(
      mysql`
        select resource.id as id, v.value as label, COUNT(distinct v2.value_resource_id) as manifest_count
        from resource
                 left join resource_class on resource.resource_class_id = resource_class.id
                 left join value vr on resource.id = vr.resource_id
                 left join value v on resource.id = v.resource_id
                 left join value v2 on resource.id = v2.resource_id
        where resource_class.local_name = 'Collection'
          and resource.id = ${id}
          and v.property_id = 1 
          ${raw(siteId ? mysql`and vr.property_id = 33 and vr.uri = ${`urn:madoc:site:${siteId}`}` : '')}
          and resource_type = ${ResourceItemSet}
        group by resource.id, v.value
    `,
      connection
    );
  }

  /**
   * @deprecated
   * @internal
   */
  async getCollections(page = 0, siteId?: number, connection?: PoolConnection) {
    const collectionsPerPage = 5;
    const offset = collectionsPerPage * page;

    try {
      const collections = await this.many<{ id: number; label: string; count: number }>(
        mysql`
          select resource.id as id, v.value as label, COUNT(distinct v2.value_resource_id) as manifest_count
          from resource
                   left join resource_class on resource.resource_class_id = resource_class.id
                   left join value vr on resource.id = vr.resource_id
                   left join value v on resource.id = v.resource_id
                   left join value v2 on resource.id = v2.resource_id
          where resource_class.local_name = 'Collection'
            and v.property_id = 1
            ${raw(siteId ? mysql`and vr.property_id = 33 and vr.uri = ${`urn:madoc:site:${siteId}`}` : '')}
            and resource_type = ${ResourceItemSet}
          group by resource.id, v.value
          limit ${offset}, ${collectionsPerPage + 1};
        `,
        connection
      );
      return {
        collections: collections.slice(0, collectionsPerPage),
        nextPage: collections.length > collectionsPerPage,
      };
    } catch (err) {
      console.log(err);
      return {
        collections: [],
        nextPage: false,
      };
    }
  }

  /**
   * @deprecated
   * @internal
   */
  async getManifestSnippetsByCollectionId(
    collectionId: number,
    pagination: { perPage: number; page: number } = { perPage: 5, page: 0 },
    connection?: PoolConnection
  ) {
    const offset = pagination.perPage * pagination.page;
    return this.many<{
      manifest_id: number;
      manifest_label: string;
      canvas_id: number;
      thumbnail: string;
    }>(
      mysql`
        select vm.resource_id        as manifest_id,
               vm.value              as manifest_label,
               vmc.value_resource_id as canvas_id,
               m.source              as thumbnail,
               m.storage_id          as thumbnail_local
        from item_set
                 left join value v on item_set.id = v.resource_id
                 left join value vm
                           on vm.id = (select vm1.id from value vm1 where vm1.resource_id = v.value_resource_id limit 1)
                 left join value vmc on vmc.id = (select vmc1.id
                                                  from value vmc1
                                                  where vmc1.resource_id = v.value_resource_id AND vmc1.property_id = 248
                                                  limit 1)
                 left join media m on vmc.value_resource_id = m.item_id
        WHERE item_set.id = ${collectionId}
          and m.media_type = 'image/jpeg'
          and vm.is_public = 1
        limit ${offset}, ${pagination.perPage}`,
      connection
    );
  }

  /**
   * @deprecated
   * @internal
   */
  async createResource({
    resource,
    values = [],
    attachedMedia = [],
    mediaType,
  }: {
    resource: Omit<Resource, 'id'>;
    values?: Array<Omit<Value, 'resource_id' | 'id'>>;
    attachedMedia?: Array<VirtualMedia | MediaValue>;
    mediaType?: Omit<Media, 'id'>;
  }) {
    return new Promise<Resource>((resolve, reject) => {
      this.connection.getConnection((cErr, connection) => {
        if (cErr) {
          reject(cErr);
        }
        connection.beginTransaction(async tErr => {
          if (tErr) {
            reject(tErr);
          }
          try {
            const item = await this.createResourceItem(connection, { resource, mediaType });

            if (resource.resource_type === ResourceItem && attachedMedia && attachedMedia.length) {
              let position = 0;
              for (const mediaItem of attachedMedia) {
                position++;

                if (mediaItem.type === 'media') {
                  // 1. save media to disk.
                  mkdirp.sync(`${fileDirectory}/original/${mediaItem.folder}`);
                  writeFileSync(
                    `${fileDirectory}/original/${mediaItem.folder}/${mediaItem.filename}.${mediaItem.extension}`,
                    mediaItem.data
                  );
                }

                // 2. save resource
                const media = await this.createResourceItem(connection, {
                  resource: {
                    is_public: 1,
                    owner_id: resource.owner_id,
                    resource_type: ResourceMedia,
                    created: new Date(),
                  },
                  mediaType: {
                    ...mediaItem.media,
                    item_id: item.id,
                    position,
                  },
                });

                // 3. add value field to attach.
                values.push({
                  ...entity(media.id, 'resource'),
                  property_id: mediaItem.property_id,
                  is_public: 1,
                } as Value);
              }
            }

            if (values.length) {
              await this.one(
                mysql`
                INSERT INTO value (resource_id, property_id, value_resource_id, type, lang, value, uri, is_public) VALUES 
            ${raw(
              values
                .map(value => {
                  return mysql`(${item.id}, ${value.property_id}, ${value.value_resource_id}, ${value.type}, ${value.lang}, ${value.value}, ${value.uri}, ${value.is_public})`;
                })
                .join(',')
            )};
          `,
                connection
              );
            }

            connection.commit(function(err) {
              if (err) {
                return connection.rollback(function() {
                  connection.release();
                  reject(err);
                });
              }
              console.log('releasing lock...');
              connection.release();
              resolve(item);
            });
          } catch (err) {
            connection.rollback(() => {
              connection.release();
              reject(err);
            });
          }
        });
      });
    });
  }

  /**
   * @deprecated use context.siteManager.getSiteById() instead
   * @internal
   */
  async getSite(id: number) {
    return await this.one<LegacySiteRow>(mysql`
      select * from site where id = ${id}
    `);
  }

  /**
   * @internal use context.siteManager.getSiteBySlug() instead
   */
  async getSiteBySlug(slug: string) {
    return await this.one<LegacySiteRow>(mysql`
      select * from site where slug = ${slug}
    `);
  }

  /**
   * @todo port to site-user-repository
   */
  async getSiteIdBySlug(slug: string, userId?: number, isAdmin = false) {
    const cacheKey = `public-site-id:${slug}`;
    const publicSiteId: PublicSite | undefined = cache.get(cacheKey);
    if (publicSiteId) {
      return publicSiteId;
    }

    const site = await this.one<PublicSite>(mysql`
      select id, title, slug, is_public from site where slug = ${slug}
    `);

    if (!site) {
      return undefined;
    }

    if (site.is_public) {
      cache.put(cacheKey, site, 60 * 60 * 1000); // 1-hour cache.
    }

    // Always return if public, or if user is admin.
    if (site.is_public || isAdmin) {
      return site;
    }

    try {
      const closedSite = this.one<PublicSite>(
        mysql`
          select s.id, s.slug, s.title, s.is_public 
            from site_permission sp 
            left join site s on sp.site_id = s.id 
            where user_id=${userId} and s.id = ${site.id}
        `
      );

      if (!closedSite) {
        return undefined;
      }

      return closedSite;
    } catch (err) {
      return undefined;
    }
  }

  async query(query: Query | string, connection?: Connection): Promise<void> {
    return new Promise((resolve, reject) =>
      (connection ? connection : this.connection).query(query, error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      })
    );
  }

  async one<Result>(query: Query | string, connection?: Connection): Promise<Result> {
    return new Promise((resolve, reject) =>
      (connection ? connection : this.connection).query(query, (error, data) => {
        if (error) {
          reject(error);
        } else {
          if (!data.length) {
            reject(new NotFoundError());
          }
          resolve(data[0]);
        }
      })
    );
  }

  async maybeOne<Result>(query: Query | string, connection?: Connection): Promise<Result | undefined> {
    return new Promise((resolve, reject) =>
      (connection ? connection : this.connection).query(query, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data[0]);
        }
      })
    );
  }

  async many<Result>(query: Query | string, connection?: Connection): Promise<Result[]> {
    return new Promise((resolve, reject) =>
      (connection ? connection : this.connection).query(query, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      })
    );
  }

  // Mutations.

  async setUsersRoleOnSite(siteId: number, userId: number, newSiteRole: string) {
    const resp = await this.maybeOne<{ site_role: string }>(
      mysql`select role as site_role from site_permission where site_id = ${siteId} and user_id = ${userId}`
    );

    if (!resp) {
      // Create new role.
      await this.query(
        mysql`insert into site_permission (site_id, user_id, role) values (${siteId}, ${userId}, ${newSiteRole})`
      );
    } else {
      await this.query(
        mysql`update site_permission set role = ${newSiteRole} where site_id = ${siteId} and user_id = ${userId}`
      );
    }
  }

  async removeUserRoleOnSite(siteId: number, userId: number) {
    await this.query(mysql`
      delete from site_permission where site_id = ${siteId} and user_id = ${userId}
    `);
  }

  /**
   * @internal
   * @deprecated use context.siteManager.createUser() instead
   */
  async createUser(user: UserCreationRequest) {
    await this.query(
      mysql`
        insert into "user" (email, name, is_active, role, password_hash) values (
          ${user.email},
          ${user.name},
          false,
          ${user.role},
          null
        )
      `
    );
  }

  async deleteSite(siteId: number) {
    await this.query(mysql`delete from site where id = ${siteId} and is_public = false`);
  }

  async changeSiteVisibility(siteId: number, isPublic: boolean) {
    await this.query(mysql`update site set is_public = ${Boolean(isPublic)} where id = ${siteId}`);
  }

  async createSite(req: CreateSiteRequest, userId: number) {
    await this.query(mysql`
      insert into site (owner_id, title, slug, is_public, summary, navigation, item_pool, created, theme) values (
        ${userId},
        ${req.title},
        ${req.slug},
        ${req.is_public ? 1 : 0},
        ${req.summary || ''},
        '[]',
        '[]',
        CURRENT_TIMESTAMP(),
        'madoc-crowd-sourcing-theme'
      )
    `);
  }
}
