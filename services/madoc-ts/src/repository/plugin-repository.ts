import { generateId } from '@capture-models/helpers';
import { sql } from 'slonik';
import { PluginRow, PluginSiteRow, PluginTokenRow } from '../types/plugins';
import { PluginTokenRequest, SitePlugin } from '../types/schemas/plugins';
import { RequestError } from '../utility/errors/request-error';
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

    listPlugins: (site_id?: number) =>
      site_id
        ? sql<PluginRow & PluginSiteRow>`
        select plugin.plugin_id as plugin_id, * from plugin
          left join plugin_site ps on plugin.plugin_id = ps.plugin_id 
                                   and ps.site_id = ${site_id}`
        : sql<PluginRow & PluginSiteRow>`
        select plugin.plugin_id as plugin_id, * from plugin
          left join plugin_site ps on plugin.plugin_id = ps.plugin_id`,
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

    updateDevRevision: (pluginId: string, revisionId: string, siteId: number) => sql`
        update plugin_site set dev_revision = ${revisionId} where plugin_id = ${pluginId} and site_id = ${siteId}
    `,
  };

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

  async listPlugins(siteId: number) {
    const rows = await this.connection.any(PluginRepository.queries.listPlugins(siteId));

    return rows.map(row => PluginRepository.mapPluginRow(row));
  }

  async updateDevRevision(id: string, revision: string, siteId: number) {
    await this.connection.query(PluginRepository.inserts.updateDevRevision(id, revision, siteId));
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

    if (pluginToInstall.version !== plugin.version) {
      throw new RequestError(
        `Different version already installed, try updating. Installed: ${pluginToInstall.version}, requested: ${plugin.version}`
      );
    }

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

  /**
   * Maps single site specific or non-site specific plugin row.
   *
   * @param row
   * @param siteId
   */
  static mapPluginRow(row: PluginRow & Partial<PluginSiteRow>, includeSiteId = false): SitePlugin {
    return {
      id: row.plugin_id,
      name: row.name,
      description: row.description || '',
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
