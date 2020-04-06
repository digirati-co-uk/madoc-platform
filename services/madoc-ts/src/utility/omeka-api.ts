import { Connection, Pool, Query } from 'mysql';
import { mysql, raw } from './mysql';
import { Resource } from '../omeka/Resource';
import { Value } from '../omeka/Value';
import { phpHashCompare } from './php-hash-compare';
import { User } from '../omeka/User';

type UserSite = { id: number; role: string; slug: string; title: string };

export class OmekaApi {
  constructor(private connection: Pool) {}

  async getTerms(terms: string[]): Promise<Array<{ id: number; term: string }>> {
    return await this.many<{ id: number; term: string }>(mysql`
      SELECT property.id, CONCAT(v.prefix, ':', local_name) AS term 
      FROM property 
          LEFT JOIN vocabulary v ON property.vocabulary_id = v.id 
      WHERE CONCAT(v.prefix, ':', local_name) IN (${terms})
    `);
  }

  async getUserSites(userId: number): Promise<UserSite[]> {
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

    const sites = await this.getUserSites(user.id);
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
      const sites = await this.getUserSites(user.id);
      return { user, sites };
    }
  }

  async createResource(resource: Omit<Resource, 'id'>, values: Array<Omit<Value, 'resource_id' | 'id'>>) {
    return new Promise((resolve, reject) => {
      this.connection.getConnection((cErr, connection) => {
        if (cErr) {
          reject(cErr);
        }
        connection.beginTransaction(async tErr => {
          if (tErr) {
            reject(tErr);
          }

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

          await this.one(
            mysql`
            INSERT INTO item (id) VALUES (LAST_INSERT_ID());
          `,
            connection
          );

          await this.one(
            mysql`
            INSERT INTO value (resource_id, property_id, value_resource_id, type, lang, value, uri, is_public) VALUES 
            ${raw(
              values
                .map(value => {
                  return mysql`(LAST_INSERT_ID(), ${value.property_id}, ${value.value_resource_id}, ${value.type}, ${value.lang}, ${value.value}, ${value.uri}, ${value.is_public})`;
                })
                .join(',')
            )};
          `,
            connection
          );

          connection.commit(function(err) {
            if (err) {
              return connection.rollback(function() {
                reject(err);
              });
            }
            resolve();
          });
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
