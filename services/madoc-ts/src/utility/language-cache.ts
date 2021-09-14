import * as fs from 'fs';
import path from 'path';
import { STORAGE_API_PATH, TRANSLATIONS_PATH } from '../paths';
import { filterEmptyContent } from '../routes/admin/localisation';
import { BackendModule, InitOptions, Services, ReadCallback } from 'i18next';
import cache from 'memory-cache';

export class LanguageCache implements BackendModule {
  static type: string;
  readonly type = 'backend';

  services!: Services;
  options!: any;
  i18nextOptions!: InitOptions;

  init(services: Services, backendOptions: any, i18nextOptions: InitOptions): void {
    this.services = services;
    this.options = backendOptions;
    this.i18nextOptions = i18nextOptions;
  }

  read(language: string, namespace: string, callback: ReadCallback): void {
    const siteUrn = this.options.siteUrn;
    const bucket = this.options.bucket || 'madoc-i18n';
    const cacheKey = `language-cache:${bucket}:${siteUrn}:${language}:${namespace}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      callback(null, cached);
      return;
    }

    const localPath = path.join(TRANSLATIONS_PATH, language, `${namespace}.json`);
    const dynamicPath = siteUrn
      ? path.join(STORAGE_API_PATH, siteUrn, bucket, 'public', language, `${namespace}.json`)
      : undefined;

    const canonical: any = {};

    if (fs.existsSync(localPath)) {
      try {
        Object.assign(canonical, JSON.parse(fs.readFileSync(localPath).toString('utf-8')));
      } catch (err) {
        // no-op.
      }
    }

    if (siteUrn && dynamicPath && fs.existsSync(dynamicPath)) {
      try {
        Object.assign(canonical, JSON.parse(fs.readFileSync(dynamicPath).toString('utf-8')));
      } catch (err) {
        // no-op.
      }
    }

    const storedLocale = filterEmptyContent(canonical);

    cache.put(cacheKey, storedLocale, 600);
    callback(null, storedLocale);
  }

  create(languages: string[], namespace: string, key: string, fallbackValue: string): void {
    // @todo lets come back to writing.
    // console.log('language cache create() => ', languages, namespace, key, fallbackValue);
  }
}

LanguageCache.type = 'backend';
