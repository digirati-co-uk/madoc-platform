import { sql } from 'slonik';
import { generateId } from '../frontend/shared/capture-models/helpers/generate-id';
import { PluginRow, PluginSiteRow, PluginTokenRow } from '../types/plugins';
import { PluginTokenRequest, SitePlugin } from '../types/schemas/plugins';
import { BaseRepository } from './base-repository';

export class PluginRepository extends BaseRepository {
  static queries = {
    /**
     * Returns plugin, not site specific.
     * @param id
     */
    getPlugin: (id: string) => sql<PluginRow>`
      select *
      from plugin
      where plugin_id = ${id}`,

    /**
     * Returns plugin, site specific.
     *
     * @param id
     * @param site_id
     */
    getSitePlugin: (id: string, site_id: number) => sql<PluginRow & PluginSiteRow>`
      select plugin.plugin_id as plugin_id, * from plugin
        left join plugin_site ps on plugin.plugin_id = ps.plugin_id
        where
          plugin.plugin_id = ${id} and
          ps.site_id = ${site_id}
    `,

    /**
     * Returns plugin, site specific.
     *
     * @param owner
     * @param repo
     */
    getPluginByRepository: (owner: string, repo: string) => sql<PluginRow>`
      select * from plugin where
          plugin.repository_owner = ${owner} and
          plugin.repository = ${repo}
    `,

    listPlugins: (site_id?: number) =>
      site_id
        ? sql<PluginRow & PluginSiteRow>`
        select
            p.plugin_id as plugin_id,
            p.name as name,
            p.description as description,
            p.repository as repository,
            p.repository_owner as repository_owner,
            p.version as version,
            p.thumbnail as thumbnail,
            p.installed as installed,
            ps.enabled as enabled,
            ps.site_id as site_id,
            ps.dev_revision as dev_revision,
            ps.dev_mode as dev_mode
        from plugin p
          left join plugin_site ps on p.plugin_id = ps.plugin_id 
                                   and ps.site_id = ${site_id}`
        : sql<PluginRow & PluginSiteRow>`
        select
            p.plugin_id as plugin_id, 
            p.name as name, 
            p.description as description, 
            p.repository as repository, 
            p.repository_owner as repository_owner, 
            p.version as version, 
            p.thumbnail as thumbnail, 
            p.installed as installed,
            ps.enabled as enabled,
            ps.site_id as site_id,
            ps.dev_revision as dev_revision,
            ps.dev_mode as dev_mode
        from plugin p
          left join plugin_site ps on p.plugin_id = ps.plugin_id`,
  };

  static inserts = {
    /**
     * Inserts plugin, not site specific.
     * @param plugin
     */
    cretePlugin: (plugin: PluginRow) => sql<PluginRow>`
      insert into plugin (plugin_id, name, description, repository, repository_owner, version, thumbnail, installed)
      values (
        ${plugin.plugin_id}, 
        ${plugin.name}, 
        ${plugin.description || ''}, 
        ${plugin.repository}, 
        ${plugin.repository_owner}, 
        ${plugin.version},
        ${plugin.thumbnail || null},
        ${plugin.installed}
      ) returning *
    `,

    /**
     * Upserts plugin / site relationship.
     * @param pluginSite
     */
    upsertSitePlugin: (pluginSite: PluginSiteRow) => sql<PluginSiteRow>`
      insert into plugin_site (plugin_id, site_id, enabled, dev_mode, dev_revision) 
      values (
        ${pluginSite.plugin_id},
        ${pluginSite.site_id},
        ${pluginSite.enabled},
        ${pluginSite.dev_mode || false},
        ${pluginSite.dev_revision || null}
      ) on conflict (plugin_id, site_id) do update set
        dev_mode = ${pluginSite.dev_mode || false},
        dev_revision = ${pluginSite.dev_revision || null},
        enabled = ${pluginSite.enabled}
      returning *
    `,

    createPluginToken: (pluginToken: PluginTokenRow) => sql<PluginTokenRow>`
      insert into plugin_token (id, name, token_hash, expires_in, revoked, dev_token, user_id, scope, plugin_id, site_id) 
      values (
        ${pluginToken.id},
        ${pluginToken.name},
        ${pluginToken.token_hash},
        ${pluginToken.expires_in},
        ${false},
        ${pluginToken.dev_token},
        ${pluginToken.user_id},
        ${sql.array(pluginToken.scope, 'text')},
        ${pluginToken.plugin_id},
        ${pluginToken.site_id}
      ) returning *
    `,
  };

  static updates = {
    updateDevRevision: (pluginId: string, revisionId: string, siteId: number) => sql`
        update plugin_site set dev_revision = ${revisionId} where plugin_id = ${pluginId} and site_id = ${siteId}
    `,

    updatePlugin: (id: string, version: string, name: string, description?: string, thumbnail?: string) => sql<
      PluginRow
    >`
        update plugin 
            set version = ${version},
                name = ${name},
                description = ${description || ''},
                thumbnail = ${thumbnail || null} 
        where plugin_id = ${id} returning *
    `,
  };

  async enablePlugin(id: string, siteId: number) {
    await this.connection.query(
      PluginRepository.inserts.upsertSitePlugin({
        plugin_id: id,
        site_id: siteId,
        enabled: true,
        dev_mode: false,
        dev_revision: null,
      })
    );
  }

  async disablePlugin(id: string, siteId: number) {
    await this.connection.query(
      PluginRepository.inserts.upsertSitePlugin({
        plugin_id: id,
        site_id: siteId,
        enabled: false,
        dev_mode: false,
        dev_revision: null,
      })
    );
  }

  /**
   * This is a manual way of creating a plugin. If it already exists, this won't do anything.
   * It will not enable it on the site either.
   */
  async createPlugin(plugin: SitePlugin) {
    const existingPlugin = await this.getPlugin(plugin.id);
    if (existingPlugin) {
      return existingPlugin;
    }

    return PluginRepository.mapPluginRow(
      await this.connection.one(
        PluginRepository.inserts.cretePlugin({
          plugin_id: plugin.id,
          repository: plugin.repository.name,
          repository_owner: plugin.repository.owner,
          version: plugin.version,
          name: plugin.name,
          description: plugin.description,
          thumbnail: plugin.thumbnail,
          installed: plugin.installed,
        })
      )
    );
  }

  /**
   * Returns site plugin
   *
   * @param id
   * @param siteId
   *
   * @throws import('slonik').NotFoundError
   */
  async getSitePlugin(id: string, siteId: number) {
    return PluginRepository.mapPluginRow(
      // Will error if it doesn't exist.
      await this.connection.one(PluginRepository.queries.getSitePlugin(id, siteId))
    );
  }

  async getPluginByRepository(owner: string, repo: string) {
    const resp = await this.connection.maybeOne(PluginRepository.queries.getPluginByRepository(owner, repo));
    if (!resp) {
      return null;
    }

    return PluginRepository.mapPluginRow(
      // Will error if it doesn't exist.
      resp
    );
  }

  async listPlugins(siteId: number) {
    const rows = await this.connection.any(PluginRepository.queries.listPlugins(siteId));

    return rows.map(row => PluginRepository.mapPluginRow(row));
  }

  async updateDevRevision(id: string, revision: string, siteId: number) {
    await this.connection.query(PluginRepository.updates.updateDevRevision(id, revision, siteId));
  }

  async updatePlugin(id: string, version: string, name: string, description?: string, thumbnail?: string) {
    return PluginRepository.mapPluginRow(
      await this.connection.one(PluginRepository.updates.updatePlugin(id, version, name, description, thumbnail))
    );
  }

  /**
   * Installs plugin into site.
   *
   * @param plugin
   * @param siteId
   */
  async installPlugin(plugin: SitePlugin, siteId: number) {
    // Upsert plugin.
    const pluginToInstall = await this.createPlugin(plugin);

    // @todo come back to this and how dev mode works.
    // if (pluginToInstall.version !== plugin.version) {
    //   throw new RequestError(
    //     `Different version already installed, try updating. Installed: ${pluginToInstall.version}, requested: ${plugin.version}`
    //   );
    // }

    await this.connection.one(
      PluginRepository.inserts.upsertSitePlugin({
        plugin_id: pluginToInstall.id,
        enabled: plugin.enabled,
        dev_revision: plugin.development.enabled ? plugin.development.revision : null,
        site_id: siteId,
        dev_mode: plugin.development.enabled,
      })
    );

    return this.getSitePlugin(plugin.id, siteId);
  }

  /**
   * Returns a single plugin, or undefined.
   *
   * @param id
   */
  async getPlugin(id: string) {
    const row = await this.connection.maybeOne(PluginRepository.queries.getPlugin(id));

    if (row) {
      return PluginRepository.mapPluginRow(row);
    }

    return undefined;
  }

  async getPluginSites(id: string) {
    const { site_count } = await this.connection.one(
      sql<{
        site_count: number;
      }>`select COUNT(*) as site_count from plugin_site where plugin_id = ${id} and enabled = true`
    );
    return site_count;
  }

  async deletePlugin(id: string) {
    await this.connection.query(sql`
        delete from plugin where plugin_id = ${id}
    `);
  }

  /**
   * Maps single site specific or non-site specific plugin row.
   *
   * @param row
   * @param includeSiteId
   */
  static mapPluginRow(row: PluginRow & Partial<PluginSiteRow>, includeSiteId = false): SitePlugin {
    return {
      id: row.plugin_id,
      name: row.name,
      description: row.description || '',
      thumbnail: row.thumbnail || '',
      enabled: Boolean(row.enabled),
      repository: {
        name: row.repository,
        owner: row.repository_owner,
      },
      installed: row.installed,
      development: {
        enabled: row.dev_mode || false,
        revision: row.dev_revision as string,
      },
      version: row.version,
      siteId: includeSiteId ? row.site_id : undefined,
    };
  }

  /**
   * Create a token for publishing plugins
   */
  async createPluginToken(tokenRequest: PluginTokenRequest, userId: number, siteId: number) {
    return await this.connection.query(
      PluginRepository.inserts.createPluginToken({
        id: generateId(),
        name: tokenRequest.name,
        plugin_id: tokenRequest.pluginId,
        site_id: siteId,
        user_id: userId,
        dev_token: tokenRequest.isDevToken,
        expires_in: tokenRequest.expiresIn,
        token_hash: tokenRequest.tokenHash,
        scope: tokenRequest.scope,
        revoked: false,
        last_used: null,
      })
    );
  }
}
