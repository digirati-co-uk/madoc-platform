import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';
import { sql } from 'slonik';
import { THEMES_PATH } from '../paths';
import { DiskTheme, ResolvedTheme, ThemeRow, ThemeSiteRow } from '../types/themes';
import { b64EncodeUnicode } from '../utility/base64';
import { BaseRepository } from './base-repository';
import cache from 'memory-cache';

export class ThemeRepository extends BaseRepository {
  // List themes
  async listThemes() {
    return this.connection.any(sql<ThemeRow>`select * from theme`);
  }

  // Get theme
  async getTheme(id: string) {
    return this.connection.one(sql<ThemeRow>`select * from theme where theme_id = ${id}`);
  }

  async deleteTheme(id: string) {
    return this.connection.query(sql`delete from theme where theme_id = ${id}`);
  }

  async getResolveTheme(siteId: number, force = false) {
    const theme = await this.getSiteTheme(siteId);
    if (!theme) {
      return null;
    }
    const cacheKey = `${theme.theme_id}/${siteId}`;
    const cachedTheme = cache.get(cacheKey);
    if (cachedTheme && !force) {
      return cachedTheme as ResolvedTheme;
    }

    const resolvedTheme: ResolvedTheme = {
      id: theme.theme_id,
      theme: theme.theme,
      name: theme.name,
      html: {
        header: this.loadFragment(theme.theme_id, 'header.html'),
        footer: this.loadFragment(theme.theme_id, 'footer.html'),
      },
      assets: {
        css: [this.loadAsset(theme.theme_id, 'style.css')].filter(Boolean),
        js: [this.loadAsset(theme.theme_id, 'main.js')].filter(Boolean),
      },
    };

    cache.put(cacheKey, resolvedTheme, 20 * 60 * 1000); // 20 minute cache.

    return resolvedTheme;
  }

  loadAsset(theme: string, bundle: string) {
    const assetPath = path.join(THEMES_PATH, theme, 'public', bundle);

    if (!existsSync(assetPath)) {
      return '';
    }

    return bundle;
  }

  loadFragment(theme: string, fragment: string) {
    const fragPath = path.join(THEMES_PATH, theme, 'fragments', fragment);

    if (!existsSync(fragPath)) {
      return '';
    }

    return b64EncodeUnicode(readFileSync(fragPath).toString('utf-8'), str =>
      new Buffer(str, 'utf-8').toString('base64')
    );
  }

  // Current site theme.
  async getSiteTheme(siteId: number) {
    return this.connection.maybeOne(
      sql<
        ThemeRow & ThemeSiteRow
      >`select * from theme left join theme_site ts on theme.theme_id = ts.theme_id where ts.site_id = ${siteId} limit 1`
    );
  }

  async getAssetPath(themeId: string, asset: string) {
    if ((asset || '').match(/\.\./)) {
      return;
    }

    const assetDirectory = path.join(THEMES_PATH, themeId, 'public');
    const assetPath = path.join(THEMES_PATH, themeId, 'public', asset);

    if (!existsSync(assetPath)) {
      return '';
    }

    return {
      assetDirectory,
      assetPath,
    };
  }

  async unsetSiteTheme(themeId: string, siteId: number) {
    try {
      await this.connection.query(sql`
          delete
          from theme_site
          where site_id = ${siteId}
            and theme_id = ${themeId}`);
    } catch (err) {
      // no-op
    }
  }

  async setSiteTheme(themeId: string, siteId: number) {
    try {
      await this.connection.query(sql`
          delete
          from theme_site
          where site_id = ${siteId}`);
    } catch (err) {
      // no-op
    }
    await this.connection.query(sql`insert into theme_site (theme_id, site_id) VALUES (${themeId}, ${siteId})`);
  }

  mapTheme(theme: ThemeRow, { siteTheme, onDisk }: { onDisk?: boolean; siteTheme?: (ThemeRow & ThemeSiteRow) | null }) {
    return {
      id: theme.theme_id,
      name: theme.name,
      description: theme.description || '',
      onDisk: !!onDisk,
      enabled: !!(siteTheme && siteTheme.theme_id === theme.theme_id),
      installed: true,
      version: theme.version,
      thumbnail: theme.thumbnail,
    };
  }

  mapDiskTheme(diskTheme: DiskTheme) {
    return {
      id: diskTheme.id,
      name: diskTheme.config.name,
      description: diskTheme.config.description || '',
      onDisk: true,
      enabled: false,
      version: diskTheme.config.version || 'v0.0.0',
      thumbnail: diskTheme.config.thumbnail || null,
      installed: false,
    };
  }

  async installTheme(theme: DiskTheme) {
    return await this.connection.one(sql<
      ThemeRow
    >`insert into theme (theme_id, name, description, thumbnail, version, enabled, theme) VALUES (
          ${theme.id},
          ${theme.config.name},
          ${theme.config.description || ''},
          ${theme.config.thumbnail || null},
          ${theme.config.version || 'v0.0.0'},
          true,
          ${sql.json(theme.config.theme || {})}
        ) returning *
    `);
  }

  // Get disk themes
  async getDiskThemes() {
    const dirs = readdirSync(THEMES_PATH);
    const diskThemes: any = {};
    for (const themeDir of dirs) {
      if (statSync(path.join(THEMES_PATH, `/${themeDir}`)).isDirectory()) {
        // We have a valid directory. Now load the JSON.
        const themeJson = path.join(THEMES_PATH, `/${themeDir}/theme.json`);
        if (existsSync(themeJson)) {
          diskThemes[themeDir] = {
            id: themeDir,
            config: JSON.parse(readFileSync(themeJson).toString('utf-8')),
          };
        }
      }
    }
    return diskThemes;
  }

  async getDiskTheme(themeDir: string) {
    if (themeDir.indexOf('../') !== -1) {
      return null;
    }

    if (statSync(path.join(THEMES_PATH, `/${themeDir}`)).isDirectory()) {
      const themeJson = path.join(THEMES_PATH, `/${themeDir}/theme.json`);
      if (existsSync(themeJson)) {
        return {
          id: themeDir,
          config: JSON.parse(readFileSync(themeJson).toString('utf-8')),
        } as DiskTheme;
      }
    }

    return null;
  }
}
