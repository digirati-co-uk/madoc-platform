import { promises, existsSync } from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import { sql } from 'slonik';
import { THEMES_PATH } from '../paths';
import { DiskTheme, ResolvedTheme, ThemeListItem, ThemeRow, ThemeSiteRow } from '../types/themes';
import { b64EncodeUnicode } from '../utility/base64';
import { BaseRepository } from './base-repository';
import cache from 'memory-cache';
import DOMParser from 'dom-parser';

const { readdir, readFile, stat } = promises;

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
        header: await this.loadFragment(theme.theme_id, 'header.html'),
        footer: await this.loadFragment(theme.theme_id, 'footer.html'),
        main: await this.loadFragment(theme.theme_id, 'main.html'),
        inlineJs: [],
      },
      assets: {
        css: [this.loadAsset(theme.theme_id, 'style.css'), ...(theme.extra?.stylesheets || [])].filter(Boolean),
        js: [this.loadAsset(theme.theme_id, 'main.js'), ...(theme.extra?.scripts || [])].filter(Boolean),
        footerJs: [...(theme.extra?.footerScripts || [])],
      },
      // @todo add inline theme configuration for classnames.
      classNames: {
        html: theme.extra?.classNames?.html,
        main: theme.extra?.classNames?.main,
      },
      languages: {},
      options: theme.extra?.options || {},
    };

    if (theme.extra && theme.extra.remote) {
      await ThemeRepository.addRemoteConfig(resolvedTheme, theme);
    }

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

  async loadFragment(theme: string, fragment: string) {
    const fragPath = path.join(THEMES_PATH, theme, 'fragments', fragment);

    if (!existsSync(fragPath)) {
      return '';
    }

    const data = await readFile(fragPath);

    return ThemeRepository.encodeFragment(data.toString('utf-8'));
  }

  static encodeFragment(data: string) {
    return b64EncodeUnicode(data, str => {
      return new Buffer(str, 'utf-8').toString('base64');
    });
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

  mapTheme(
    theme: ThemeRow,
    {
      siteTheme,
      onDisk,
      isPlugin,
    }: { onDisk?: boolean | undefined; isPlugin?: boolean | undefined; siteTheme?: (ThemeRow & ThemeSiteRow) | null }
  ): ThemeListItem {
    return {
      id: theme.theme_id,
      name: theme.name,
      description: theme.description || '',
      onDisk: !!onDisk || !!isPlugin,
      isPlugin: !!isPlugin,
      enabled: !!(siteTheme && siteTheme.theme_id === theme.theme_id),
      installed: true,
      version: theme.version,
      thumbnail: theme.thumbnail,
      extra: theme.extra || {},
    };
  }

  mapDiskTheme(diskTheme: DiskTheme, plugin = false): ThemeListItem {
    return {
      id: diskTheme.id,
      name: diskTheme.config.name,
      description: diskTheme.config.description || '',
      onDisk: true,
      isPlugin: plugin,
      enabled: false,
      version: diskTheme.config.version || 'v0.0.0',
      thumbnail: diskTheme.config.thumbnail || null,
      installed: false,
      extra: diskTheme.config.extra || {},
    };
  }

  async installTheme(diskTheme: DiskTheme) {
    const { theme, name, description, thumbnail, version, extra = {} } = diskTheme.config || {};
    return await this.connection.one(sql<
      ThemeRow
    >`insert into theme (theme_id, name, description, thumbnail, version, enabled, theme, extra) VALUES (
          ${diskTheme.id},
          ${name},
          ${description || ''},
          ${thumbnail || null},
          ${version || 'v0.0.0'},
          true,
          ${sql.json(theme || {})},
          ${sql.json((extra as any) || {})}
        ) returning *
    `);
  }

  // Get disk themes
  async getDiskThemes() {
    const dirs = await readdir(THEMES_PATH);
    const diskThemes: any = {};
    for (const themeDir of dirs) {
      const dirStat = await stat(path.join(THEMES_PATH, `/${themeDir}`));
      if (dirStat.isDirectory()) {
        // We have a valid directory. Now load the JSON.
        const themeJson = path.join(THEMES_PATH, `/${themeDir}/theme.json`);
        if (existsSync(themeJson)) {
          const file = await readFile(themeJson);
          diskThemes[themeDir] = {
            id: themeDir,
            config: JSON.parse(file.toString('utf-8')),
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
    const dirStat = await stat(path.join(THEMES_PATH, `/${themeDir}`));
    if (dirStat.isDirectory()) {
      const themeJson = path.join(THEMES_PATH, `/${themeDir}/theme.json`);
      if (existsSync(themeJson)) {
        const file = await readFile(themeJson);
        return {
          id: themeDir,
          config: JSON.parse(file.toString('utf-8')),
        } as DiskTheme;
      }
    }

    return null;
  }

  static async addRemoteConfig(resolvedTheme: ResolvedTheme, theme: ThemeRow & ThemeSiteRow): Promise<void> {
    try {
      const languages = Object.keys(theme.extra?.remote?.languages || {});
      const languageConfig = theme.extra?.remote?.languages || {};

      if (languages.length) {
        let hasDefaultHeaderExtracted = false;
        let hasDefaultFooterExtracted = false;
        for (let i = 0; i < languages.length; i++) {
          const item = languageConfig[languages[i]];

          if (item.header) {
            const fetched = await fetch(item.header);
            const parsed = ThemeRepository.parseRemoteHeader(await fetched.text());

            if (!hasDefaultHeaderExtracted) {
              // Add stylesheets.
              for (const stylesheet of parsed.stylesheets) {
                if (resolvedTheme.assets.css.indexOf(stylesheet) === -1) {
                  resolvedTheme.assets.css.push(stylesheet);
                }
              }
              // Add scripts
              for (const script of parsed.scripts) {
                if (resolvedTheme.assets.js.indexOf(script) === -1) {
                  resolvedTheme.assets.js.push(script);
                }
              }
              if (parsed.inlineScripts.length) {
                if (!resolvedTheme.html.inlineJs) {
                  resolvedTheme.html.inlineJs = [];
                }
                for (const script of parsed.inlineScripts) {
                  if (resolvedTheme.html.inlineJs.indexOf(script) === -1) {
                    resolvedTheme.html.inlineJs.push(script);
                  }
                }
              }
              if (parsed.mainHTML) {
                resolvedTheme.html.main = ThemeRepository.encodeFragment(parsed.mainHTML);
              }
              if (parsed.headerHTML) {
                resolvedTheme.html.header = ThemeRepository.encodeFragment(parsed.headerHTML);
              }
              if (parsed.mainElement?.className && typeof resolvedTheme.classNames.main === 'undefined') {
                resolvedTheme.classNames.main = parsed.mainElement.className;
              }
              // @todo extract HTML class name.
              hasDefaultHeaderExtracted = true;
            }

            const res = (resolvedTheme.languages[languages[i]] = resolvedTheme.languages[languages[i]] || {});
            res.html = res.html || {};
            res.html.header = ThemeRepository.encodeFragment(parsed.headerHTML);
            if (parsed.inlineScripts.length) {
              res.html.inlineJs = res.html.inlineJs || [];
              for (const script of parsed.inlineScripts) {
                if (res.html.inlineJs.indexOf(script) === -1) {
                  res.html.inlineJs.push(script);
                }
              }
            }
          }

          if (item.footer) {
            const fetched = await fetch(item.footer);
            const parsed = ThemeRepository.parseRemoteFooter(await fetched.text());

            if (!hasDefaultFooterExtracted) {
              if (parsed.footerHTML) {
                resolvedTheme.html.footer = ThemeRepository.encodeFragment(parsed.footerHTML);
              }

              for (const script of parsed.scripts) {
                resolvedTheme.assets.footerJs.push(script);
              }

              for (const script of parsed.inlineScripts) {
                resolvedTheme.html.footerInlineJs = resolvedTheme.html.footerInlineJs || [];
                if (resolvedTheme.html.footerInlineJs.indexOf(script) === -1) {
                  resolvedTheme.html.footerInlineJs.push(script);
                }
              }

              hasDefaultFooterExtracted = true;
            }

            if (parsed.footerHTML) {
              const res = (resolvedTheme.languages[languages[i]] = resolvedTheme.languages[languages[i]] || {});
              res.html = res.html || {};

              // @todo actually parse and fetch the footer.
              res.html.footer = ThemeRepository.encodeFragment(parsed.footerHTML);
            }
          }
        }
      }

      // Fallback for simple case.
      if (theme.extra && theme.extra.remote && (theme.extra.remote.header || theme.extra.remote.footer)) {
        // Parse single header and footer.
      }
    } catch (e) {
      // ignore errors.
      console.log(e);
    }
  }

  static parseRemoteFooter(html: string) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(ThemeRepository.cleanHTML(html));
    const parsed: {
      footerHTML: string;
      scripts: string[];
      inlineScripts: string[];
    } = {
      inlineScripts: [],
      scripts: [],
      footerHTML: '',
    };

    const scripts = dom.getElementsByTagName('script');
    if (scripts) {
      for (const script of scripts) {
        const src = script.getAttribute('src');
        if (src) {
          parsed.scripts.push(src);
        } else {
          parsed.inlineScripts.push(script.innerHTML.trim());
        }
      }
    }

    const footer = dom.getElementsByTagName('footer');
    if (footer && footer[0]) {
      parsed.footerHTML = footer[0].outerHTML || '';
    }

    return parsed;
  }

  static cleanHTML(html: string): string {
    // for any hacks.
    html = html.replace(/class ="/g, 'class="');

    return html;
  }

  // Helpers.
  static parseRemoteHeader(html: string) {
    const parsed: {
      meta: Record<string, string>[];
      stylesheets: string[];
      scripts: string[];
      inlineScripts: string[];
      headerHTML: string;
      mainHTML: string;
      mainElement?: {
        id?: string | null;
        className?: string | null;
      };
    } = {
      inlineScripts: [],
      scripts: [],
      stylesheets: [],
      meta: [],
      headerHTML: '',
      mainHTML: '',
    };

    const parser = new DOMParser();
    const dom = parser.parseFromString(ThemeRepository.cleanHTML(html));
    const heads = dom.getElementsByTagName('head');
    const head = heads ? heads[0] : null;

    const bodys = dom.getElementsByTagName('body');
    const body = bodys ? bodys[0] : null;

    if (head) {
      const meta = head.getElementsByTagName('meta');
      if (meta) {
        for (const metaItem of meta) {
          const attrs: any = {};
          for (const attr of metaItem.attributes as any) {
            attrs[attr.name] = attr.value;
          }
          // These are already added by Madoc.
          if (attrs.name === 'viewport') continue;
          if (attrs.charset) continue;
          parsed.meta.push(attrs);
        }
      }

      const scripts = dom.getElementsByTagName('script');
      if (scripts) {
        for (const script of scripts) {
          const src = script.getAttribute('src');
          if (src) {
            parsed.scripts.push(src);
          } else {
            parsed.inlineScripts.push(script.innerHTML.trim());
          }
        }
      }

      const links = dom.getElementsByTagName('link');
      if (links) {
        for (const link of links) {
          if (link.getAttribute('rel') === 'stylesheet') {
            const href = link.getAttribute('href');
            if (href) {
              parsed.stylesheets.push(href);
            }
            // New stylesheet.
          }
          // Ignore the rest.
        }
      }
    }

    if (body) {
      // We want to avoid role="main" wrapping.
      const parts = [];
      for (const node of body.childNodes) {
        const role = node.getAttribute('role');
        if (role === 'main') {
          // Parse main attributes.
          parsed.mainElement = {
            id: node.getAttribute('id'),
            className: node.getAttribute('class'),
          };
          parsed.mainHTML = node.innerHTML.trim();
          continue;
        }

        parts.push(node.outerHTML);
      }

      parsed.headerHTML = parts.join('');
    }

    return parsed;
  }
}
