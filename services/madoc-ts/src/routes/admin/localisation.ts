import * as path from 'path';
import * as fs from 'fs';
import { calculateTranslationProgress } from '../../frontend/shared/utility/calculate-translation-progress';
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { parseEtag } from '../../utility/parse-etag';
import { optionalUserWithScope, userWithScope } from '../../utility/user-with-scope';

const diskLocalisations = path.resolve(__dirname, '../../../translations'); // en/madoc.json
const baseConfiguration = path.resolve(__dirname, '../../../translations/en/madoc.json');

export type LocalisationSiteConfig = {
  defaultLanguage: string;
  availableLanguages: {
    [language: string]: {
      url: string;
      remote: boolean;
    };
  };
};

const defaultSiteLocalisationSiteConfig: LocalisationSiteConfig = {
  defaultLanguage: 'en',
  availableLanguages: {},
};

export type ListLocalisationsResponse = {
  defaultLanguage: string;
  localisations: Array<{
    code: string;
    percent?: number;
    isStatic: boolean;
  }>;
};

export const listLocalisations: RouteMiddleware = async context => {
  const { id, siteId } = optionalUserWithScope(context, []);
  const userApi = context.state.siteApi || api.asUser({ userId: id, siteId });

  // 1. Configuration localisations (storage API links in storage server)
  const configResponse = await userApi.getConfiguration<LocalisationSiteConfig>('madoc-i18n', [
    `urn:madoc:site:${siteId}`,
  ]);
  const config = configResponse?.config[0]?.config_object || defaultSiteLocalisationSiteConfig;
  const keys = Object.keys(config.availableLanguages);

  // 2. Disk localisations
  // List directory diskLocalisations
  const directories = fs.readdirSync(diskLocalisations);
  const staticKeys: string[] = [];
  for (const dir of directories) {
    // Check for madoc.json
    if (keys.indexOf(dir) === -1 && fs.existsSync(path.join(diskLocalisations, dir, 'madoc.json'))) {
      staticKeys.push(dir);
    }
  }

  context.response.body = {
    defaultLanguage: config.defaultLanguage || 'en',
    localisations: [
      ...staticKeys.map(key => ({
        code: key,
        isStatic: true,
      })),
      ...keys.map(key => ({
        code: key,
        isStatic: false,
      })),
    ],
  } as ListLocalisationsResponse;
};

export type GetLocalisationResponse = {
  code: string;
  isStatic: boolean;
  isDynamic: boolean;
  percentage: number;
  content: {
    [key: string]: string;
  };
};

function loadLocaleTemplate() {
  const baseJson = JSON.parse(fs.readFileSync(baseConfiguration).toString());
  const emptyJson: any = {};
  for (const key of Object.keys(baseJson)) {
    emptyJson[key] = '';
  }
  return emptyJson;
}

function filterEmptyContent(obj: any) {
  const nonEmpty: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key]) {
      nonEmpty[key] = obj[key];
    }
  }
  return nonEmpty;
}

export const getLocalisation: RouteMiddleware<{ code: string }> = async context => {
  const { id, siteId } = optionalUserWithScope(context, []);
  const userApi = context.state.siteApi || api.asUser({ userId: id, siteId });
  const showEmpty = castBool(context.query.show_empty);

  // Language code
  const languageCode = context.params.code;

  if (languageCode.match(/\.\./)) {
    context.status = 404;
    return;
  }

  // Load default english.
  const emptyJson = loadLocaleTemplate();

  // Load from disk if exists.
  const location = path.resolve(diskLocalisations, languageCode, 'madoc.json');
  const isStatic = fs.existsSync(location);
  const staticOverride = isStatic ? JSON.parse(fs.readFileSync(location).toString()) : {};

  // Load from config if exists.
  const configResponse = await userApi.getConfiguration<LocalisationSiteConfig>('madoc-i18n', [
    `urn:madoc:site:${siteId}`,
  ]);
  const config = configResponse?.config[0]?.config_object || defaultSiteLocalisationSiteConfig;
  if (config && config.availableLanguages[languageCode]) {
    const found = config.availableLanguages[languageCode];
    // Merge.
    const url = found.remote ? found.url : api.resolveUrl(found.url);
    const overrideJson = await fetch(url).then(r => r.json());

    const content = {
      ...emptyJson,
      ...staticOverride,
      ...overrideJson,
    };

    context.response.body = {
      code: languageCode,
      isDynamic: true,
      isStatic,
      percentage: calculateTranslationProgress(content),
      content: showEmpty ? content : filterEmptyContent(content),
    } as GetLocalisationResponse;
    return;
  }

  // Combine + calculate percentage.
  const content = {
    ...emptyJson,
    ...staticOverride,
  };

  context.response.body = {
    code: languageCode,
    isDynamic: false,
    isStatic,
    percentage: calculateTranslationProgress(content),
    content: showEmpty ? content : filterEmptyContent(content),
  } as GetLocalisationResponse;
};

export const updateLocalisation: RouteMiddleware<{ code: string }> = async context => {
  const { id, siteId } = userWithScope(context, ['site.admin']);
  const userApi = api.asUser({ userId: id, siteId });

  // Language code
  const languageCode = context.params.code;

  if (languageCode.match(/\.\./)) {
    context.status = 404;
    return;
  }

  const keys = Object.keys(context.requestBody);
  const template = loadLocaleTemplate();
  const validStrings: any = {};
  for (const key of keys) {
    if (typeof template[key] !== 'undefined' && typeof context.requestBody[key] === 'string') {
      validStrings[key] = context.requestBody[key];
    }
  }

  // Create language in storage API at specific location.
  await userApi.saveStorageJson('madoc-i18n', `${languageCode}/madoc.json`, validStrings, true);
  const url = `/public/storage/urn:madoc:site:${siteId}/madoc-i18n/public/${languageCode}/madoc.json`;

  // Save to site configuration
  const configResponse = await userApi.getConfiguration<LocalisationSiteConfig>('madoc-i18n', [
    `urn:madoc:site:${siteId}`,
  ]);
  const oldConfiguration = configResponse.config[0];
  const newConfiguration: LocalisationSiteConfig = {
    ...defaultSiteLocalisationSiteConfig,
    ...(oldConfiguration ? oldConfiguration.config_object : {}),
    availableLanguages: {
      ...(oldConfiguration ? oldConfiguration.config_object.availableLanguages : {}),
      [languageCode]: {
        url,
        remote: false,
      },
    },
  };

  if (oldConfiguration && oldConfiguration.id) {
    const rawConfiguration = await userApi.getSingleConfigurationRaw(oldConfiguration.id);
    const etagHeader = rawConfiguration.headers.get('etag');
    const etag = etagHeader ? parseEtag(etagHeader.toString()) : undefined;

    if (etag) {
      //  - If it exists, then grab the UUID and update that resource
      await userApi.replaceConfiguration(oldConfiguration.id, etag, newConfiguration);
    }
  } else {
    try {
      //  - If it does not exist, then POST the new configuration.
      await userApi.addConfiguration('madoc-i18n', [`urn:madoc:site:${siteId}`], newConfiguration);
    } catch (err) {
      console.log('Could not save config', err);
    }
  }

  context.response.status = 201;
  context.response.body = {
    code: languageCode,
    percentage: calculateTranslationProgress(validStrings),
    content: validStrings,
  };
};
