import { Connection, Pool, PoolConnection, Query } from 'mysql';
import { mysql, raw } from './mysql';
import { Resource, ResourceItem, ResourceItemSet, ResourceMedia } from '../types/omeka/Resource';
import { Value } from '../types/omeka/Value';
import { phpHashCompare } from './php-hash-compare';
import { User } from '../types/omeka/User';
import { entity, MediaValue, urlMedia, VirtualMedia } from './field-value';
import { Media } from '../types/omeka/Media';
import { writeFileSync } from 'fs';
import mkdirp from 'mkdirp';

type UserSite = { id: number; role: string; slug: string; title: string };

const fileDirectory = process.env.OMEKA_FILE_DIRECTORY || '/home/node/app/omeka-files';

export class OmekaApi {
  constructor(private connection: Pool) {}

  static getFileDirectory(file: string) {
    return `${fileDirectory}/original${file}`;
  }

  async getTerms<T extends string>(terms: T[]): Promise<{ [term in T]: { id: number; term: string } }> {
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

  async getSiteLabelById(siteId?: number) {
    if (!siteId) {
      return;
    }
    const site = await this.one<{ label: string }>(mysql`select title from site where id = ${siteId}`);

    return site.label;
  }

  async getUserSites(userId: number, role: string): Promise<UserSite[]> {
    if (role && role === 'global_admin') {
      const sites = await this.many<UserSite>(mysql`SELECT s.id, s.slug, s.title FROM site s`);
      return sites.map(s => ({ ...s, role: 'admin' }));
    }

    try {
      return await this.many<UserSite>(mysql`
        SELECT s.id, sp.role, s.slug, s.title FROM site_permission sp LEFT JOIN site s on sp.site_id = s.id WHERE user_id=${userId}
      `);
    } catch (err) {
      return [];
    }
  }

  async getUser(id: number) {
    const user = await this.one<User>(
      mysql`SELECT id, name, email, role FROM user WHERE is_active = true AND id = ${id}`
    );

    if (!user) {
      return undefined;
    }

    const sites = await this.getUserSites(user.id, user.role);
    return { user, sites };
  }

  async verifyLogin(email: string, password: string) {
    const user = await this.one<User>(
      mysql`SELECT id, name, email, password_hash, role FROM user WHERE is_active = true AND email = ${email}`
    );

    if (!user || !password || !user.password_hash) {
      return undefined;
    }

    if (await phpHashCompare(password, user.password_hash)) {
      const sites = await this.getUserSites(user.id, user.role);
      return { user, sites };
    }
  }

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

  async one<Result>(query: Query | string, connection?: Connection): Promise<Result> {
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
}
