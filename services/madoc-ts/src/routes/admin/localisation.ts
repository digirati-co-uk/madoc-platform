import * as path from 'path';
import * as fs from 'fs';
import { sql } from 'slonik';
import { Headers } from 'node-fetch';
import invariant from 'tiny-invariant';
import { TextFieldProps } from '../../frontend/shared/capture-models/editor/input-types/TextField/TextField';
import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { calculateTranslationProgress } from '../../frontend/shared/utility/calculate-translation-progress';
import { ApiClientWithoutExtensions } from '../../gateway/api';
import { api } from '../../gateway/api.server';
import { TRANSLATIONS_PATH } from '../../paths';
import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { parseEtag } from '../../utility/parse-etag';
import { traverseStructure } from '../../utility/traverse-structure';
import { optionalUserWithScope, userWithScope } from '../../utility/user-with-scope';

export type LocalisationSiteConfig = {
  defaultLanguage: string;
  displayLanguages?: string[];
  contentLanguages?: string[];
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
  contentLanguages: ['en'],
  displayLanguages: ['en'],
};

export type ListLocalisationsResponse = {
  defaultLanguage: string;
  contentLanguages: string[];
  displayLanguages: string[];
  localisations: Array<{
    code: string;
    percent?: number;
    isStatic: boolean;
  }>;
};

const supportedNamespaces = ['madoc', 'capture-models'];

export const extractLocalesFromContent: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, []);

  const query = sql<{ language: string; totals: number }>`
      select language as language, COUNT(*) as totals from iiif_metadata where site_id = ${siteId} and language != 'none'  group by language
  `;

  context.response.body = {
    metadata: await context.connection.any(query),
  };
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
  // List directory TRANSLATIONS_PATH
  const directories = fs.readdirSync(TRANSLATIONS_PATH);
  const staticKeys: string[] = [];
  for (const dir of directories) {
    // Check for madoc.json
    if (keys.indexOf(dir) === -1 && fs.existsSync(path.join(TRANSLATIONS_PATH, dir, 'madoc.json'))) {
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
    contentLanguages: config.contentLanguages || [...keys, ...staticKeys],
    displayLanguages: config.displayLanguages || [...keys, ...staticKeys],
  } as ListLocalisationsResponse;
};

export type GetLocalisationResponse = {
  namespace?: string;
  code: string;
  isStatic: boolean;
  isDynamic: boolean;
  percentage: number;
  content: {
    [key: string]: string;
  };
};

async function loadLocaleTemplate(userApi: ApiClientWithoutExtensions, namespace?: string, modelIds?: string[]) {
  const emptyJson: any = {};

  if (namespace === 'capture-models' && modelIds) {
    // @todo extract all language strings from all project models.
    const promises: Promise<any>[] = [];
    const foundStrings = new Set<string>();
    for (const modelId of modelIds) {
      promises.push(userApi.getCaptureModel(modelId));
    }

    for (const singleModelPromise of promises) {
      try {
        const singleModel = await singleModelPromise;
        traverseDocument(singleModel.document, {
          visitField(field) {
            if (field.label) foundStrings.add(field.label);
            if (field.description) foundStrings.add(field.description);
            if (field.pluralLabel) foundStrings.add(field.pluralLabel);
            if ((field as TextFieldProps).placeholder) {
              foundStrings.add((field as TextFieldProps).placeholder as string);
            }
          },
          visitEntity(entity) {
            if (entity.label) foundStrings.add(entity.label);
            if (entity.description) foundStrings.add(entity.description);
            if (entity.pluralLabel) foundStrings.add(entity.pluralLabel);
          },
          visitSelector(selector) {
            // Nothing to extract from selectors.
          },
        });
        traverseStructure(singleModel.structure, structure => {
          if (structure.label) foundStrings.add(structure.label);
          if (structure.description) foundStrings.add(structure.description);
          if (structure.type !== 'choice') {
            if (structure.label) foundStrings.add(structure.label);
            if (structure.description) foundStrings.add(structure.description);
            if (structure.pluralLabel) foundStrings.add(structure.pluralLabel);
            if (structure.instructions) foundStrings.add(structure.instructions);
          }
        });
      } catch (e) {
        // ignore.
      }
    }

    for (const key of foundStrings.values()) {
      emptyJson[key] = '';
    }
    return emptyJson;
  }

  const filePath = path.resolve(TRANSLATIONS_PATH, `en/${namespace}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const baseJson = JSON.parse(
        fs.readFileSync(path.resolve(TRANSLATIONS_PATH, `en/${namespace}.json`)).toString('utf-8')
      );
      for (const key of Object.keys(baseJson)) {
        emptyJson[key] = '';
      }
    } catch (e) {
      // ignore.
    }
  }
  return emptyJson;
}

export function filterEmptyContent(obj: any) {
  const nonEmpty: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key]) {
      nonEmpty[key] = obj[key];
    }
  }
  return nonEmpty;
}

export const getLocalisation: RouteMiddleware<{ code: string; namespace?: string }> = async context => {
  const { id, siteId } = optionalUserWithScope(context, []);
  const userApi = context.state.siteApi || api.asUser({ userId: id, siteId });
  const showEmpty = castBool(context.query.show_empty);

  // Language code
  const languageCode = context.params.code;
  const namespace = context.params.namespace || 'madoc';

  invariant(supportedNamespaces.includes(namespace), `Namespace ${namespace} not found`);
  invariant(!languageCode.match(/\.\./), 'Language not found');
  invariant(!namespace.match(/\.\./), 'Namespace not found');

  const modelIds =
    namespace === 'capture-models'
      ? (
          await context.connection.any(
            sql<{ capture_model_id: string }>`select capture_model_id from iiif_project where site_id = ${siteId}`
          )
        ).map(m => m.capture_model_id)
      : [];
  // Load default english.
  const emptyJson = await loadLocaleTemplate(userApi, namespace, modelIds);
  // Load from disk if exists.
  const location = path.resolve(TRANSLATIONS_PATH, languageCode, `${namespace}.json`);
  const isStatic = fs.existsSync(location);
  const staticOverride = isStatic ? JSON.parse(fs.readFileSync(location).toString()) : {};

  // Load from config if exists.
  const configResponse = await userApi.getConfiguration<LocalisationSiteConfig>(`${namespace}-i18n`, [
    `urn:madoc:site:${siteId}`,
  ]);
  const config = configResponse?.config[0]?.config_object || defaultSiteLocalisationSiteConfig;
  if (config && config.availableLanguages[languageCode]) {
    const found = config.availableLanguages[languageCode];

    const mergeRemote = async () => {
      try {
        // Merge.
        const url = found.remote ? found.url : api.resolveUrl(found.url);
        const headers = new Headers();
        headers.set('X-Cache-Bypass', 'true');
        return await fetch(url, {
          headers: headers as any,
        }).then(r => r.json());
      } catch (e) {
        console.log(e);
        return {}; // Invalid or missing remote config.
      }
    };

    const content = {
      ...emptyJson,
      ...staticOverride,
      ...(await mergeRemote()),
    };

    context.response.body = {
      namespace,
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
    namespace,

    code: languageCode,
    isDynamic: false,
    isStatic,
    percentage: calculateTranslationProgress(content),
    content: showEmpty ? content : filterEmptyContent(content),
  } as GetLocalisationResponse;
};

export const updateLanguagePreferences: RouteMiddleware<
  unknown,
  { namespace?: string; displayLanguages?: string[]; contentLanguages?: string[] }
> = async context => {
  const { id, siteId } = userWithScope(context, ['site.admin']);
  const userApi = api.asUser({ userId: id, siteId });

  const changes = context.requestBody;
  const namespace = changes.namespace || 'madoc';

  if (typeof changes.displayLanguages === 'undefined' && typeof changes.contentLanguages === 'undefined') {
    context.response.status = 204;
    return;
  }

  const configResponse = await userApi.getConfiguration<LocalisationSiteConfig>(`${namespace}-i18n`, [
    `urn:madoc:site:${siteId}`,
  ]);
  const oldConfiguration = configResponse.config[0];

  const newConfiguration: LocalisationSiteConfig = {
    ...defaultSiteLocalisationSiteConfig,
    ...oldConfiguration?.config_object,
  };

  if (typeof changes.displayLanguages !== 'undefined') {
    newConfiguration.displayLanguages = changes.displayLanguages;
  }

  if (typeof changes.contentLanguages !== 'undefined') {
    newConfiguration.contentLanguages = changes.contentLanguages;
  }

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
      await userApi.addConfiguration(`${namespace}-i18n`, [`urn:madoc:site:${siteId}`], newConfiguration);
    } catch (err) {
      console.log('Could not save config', err);
    }
  }

  context.response.status = 201;
};

export const updateLocalisation: RouteMiddleware<{ code: string; namespace?: string }> = async context => {
  const { id, siteId } = userWithScope(context, ['site.admin']);
  const userApi = api.asUser({ userId: id, siteId });

  // Language code
  const languageCode = context.params.code;
  const namespace = context.params.namespace || 'madoc';

  invariant(supportedNamespaces.includes(namespace), `Namespace ${namespace} not found`);

  if (languageCode.match(/\.\./) || namespace.match(/\.\./)) {
    context.status = 404;
    return;
  }

  const modelIds =
    namespace === 'capture-models'
      ? (
          await context.connection.any(
            sql<{ capture_model_id: string }>`select capture_model_id from iiif_project where site_id = ${siteId}`
          )
        ).map(m => m.capture_model_id)
      : [];

  const keys = Object.keys(context.requestBody);
  const template = await loadLocaleTemplate(userApi, namespace, modelIds);
  const validStrings: any = {};
  for (const key of keys) {
    if (typeof template[key] !== 'undefined' && typeof context.requestBody[key] === 'string') {
      validStrings[key] = context.requestBody[key];
    }
  }

  // Create language in storage API at specific location.
  await userApi.saveStorageJson(`madoc-i18n`, `${languageCode}/${namespace}.json`, validStrings, true);
  const url = `/public/storage/urn:madoc:site:${siteId}/madoc-i18n/public/${languageCode}/${namespace}.json`;

  // Save to site configuration
  const configResponse = await userApi.getConfiguration<LocalisationSiteConfig>(`${namespace}-i18n`, [
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
      await userApi.addConfiguration(`${namespace}-i18n`, [`urn:madoc:site:${siteId}`], newConfiguration);
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
