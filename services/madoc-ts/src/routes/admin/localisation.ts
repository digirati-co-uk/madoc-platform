import * as path from 'path';
import * as fs from 'fs';
import { sql } from 'slonik';
import { Headers } from 'node-fetch';
import invariant from 'tiny-invariant';
import type { TextFieldProps } from '../../frontend/shared/capture-models/editor/input-types/TextField/TextField';
import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { calculateTranslationProgress } from '../../frontend/shared/utility/calculate-translation-progress';
import { ApiClientWithoutExtensions } from '../../gateway/api';
import { api } from '../../gateway/api.server';
import { TRANSLATIONS_PATH } from '../../paths';
import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { parseEtag } from '../../utility/parse-etag';
import { traverseStructure } from '../../utility/traverse-structure';
import { ApiError } from '../../utility/errors/api-error';
import { optionalUserWithScope, userWithScope } from '../../utility/user-with-scope';
import type { CheckboxFieldProps } from '../../frontend/shared/capture-models/editor/input-types/CheckboxField/CheckboxField';
import type { ConfigResponse } from '../../types/schemas/config-response';

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

type LocalisationConfigRecord = NonNullable<ConfigResponse<LocalisationSiteConfig>['config'][number]>;

const I18N_CONFIG_CONTEXT = 'urn:madoc:context:localisation';
const getLegacyLocalisationConfigScope = (siteId: number) => [`urn:madoc:site:${siteId}`];
const getPrimaryLocalisationConfigScope = (siteId: number) => [`urn:madoc:site:${siteId}`, I18N_CONFIG_CONTEXT];
const getLocalisationConfigService = (namespace: string) => `${namespace}-i18n`;

function hasExactScope(config: LocalisationConfigRecord, scope: string[]) {
  return config.scope.length === scope.length && config.scope.every(scopePart => scope.includes(scopePart));
}

function getExactConfigRecord(configResponse: ConfigResponse<LocalisationSiteConfig>, scope: string[]) {
  return configResponse.config.find(
    (config): config is LocalisationConfigRecord => !!config && hasExactScope(config, scope)
  );
}

async function replaceLocalisationConfigByRecord(
  userApi: ApiClientWithoutExtensions,
  configRecord: LocalisationConfigRecord,
  newConfiguration: LocalisationSiteConfig
) {
  if (!configRecord.id) {
    return false;
  }

  const rawConfiguration = await userApi.getSingleConfigurationRaw(configRecord.id);
  const etagHeader = rawConfiguration.headers.get('etag');
  const etag = etagHeader ? parseEtag(etagHeader.toString()) : undefined;

  if (!etag) {
    return false;
  }

  await userApi.replaceConfiguration(configRecord.id, etag, newConfiguration);
  return true;
}

function isConflictError(error: unknown) {
  return error instanceof ApiError && !!error.response && typeof error.response.status === 'number' && error.response.status === 409;
}

async function saveLocalisationConfiguration(
  userApi: ApiClientWithoutExtensions,
  namespace: string,
  siteId: number,
  newConfiguration: LocalisationSiteConfig,
  existingConfigResponse?: ConfigResponse<LocalisationSiteConfig>
) {
  const configService = getLocalisationConfigService(namespace);
  const configScope = getPrimaryLocalisationConfigScope(siteId);
  const configResponse =
    existingConfigResponse || (await userApi.getConfiguration<LocalisationSiteConfig>(configService, configScope));
  const existingConfig = getExactConfigRecord(configResponse, configScope);

  if (existingConfig && (await replaceLocalisationConfigByRecord(userApi, existingConfig, newConfiguration))) {
    return;
  }

  try {
    await userApi.addConfiguration(configService, configScope, newConfiguration);
    return;
  } catch (error) {
    if (!isConflictError(error)) {
      throw error;
    }
  }

  const latestConfigResponse = await userApi.getConfiguration<LocalisationSiteConfig>(configService, configScope);
  const latestConfig = getExactConfigRecord(latestConfigResponse, configScope);
  if (latestConfig && (await replaceLocalisationConfigByRecord(userApi, latestConfig, newConfiguration))) {
    return;
  }

  throw new ApiError(`Could not save ${configService} configuration`);
}

async function loadLocalisationConfiguration(
  userApi: ApiClientWithoutExtensions,
  namespace: string,
  siteId: number
): Promise<{
  config: LocalisationSiteConfig;
  primaryResponse: ConfigResponse<LocalisationSiteConfig>;
}> {
  const configService = getLocalisationConfigService(namespace);
  const primaryScope = getPrimaryLocalisationConfigScope(siteId);
  const primaryResponse = await userApi.getConfiguration<LocalisationSiteConfig>(configService, primaryScope);
  const primaryRecord = getExactConfigRecord(primaryResponse, primaryScope);
  if (primaryRecord) {
    return {
      config: {
        ...defaultSiteLocalisationSiteConfig,
        ...primaryRecord.config_object,
      },
      primaryResponse,
    };
  }

  const legacyScope = getLegacyLocalisationConfigScope(siteId);
  const legacyResponse = await userApi.getConfiguration<LocalisationSiteConfig>(configService, legacyScope);
  const legacyRecord = getExactConfigRecord(legacyResponse, legacyScope);

  return {
    config: {
      ...defaultSiteLocalisationSiteConfig,
      ...(legacyRecord?.config_object || {}),
    },
    primaryResponse,
  };
}

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
  const loadedConfig = await loadLocalisationConfiguration(userApi, 'madoc', siteId);
  const config = loadedConfig.config;
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
            if ((field as CheckboxFieldProps).inlineLabel) {
              foundStrings.add((field as CheckboxFieldProps).inlineLabel as string);
            }
            if ((field as CheckboxFieldProps).inlineDescription) {
              foundStrings.add((field as CheckboxFieldProps).inlineDescription as string);
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
        ).map((m: { capture_model_id: string }) => m.capture_model_id)
      : [];
  // Load default english.
  const emptyJson = await loadLocaleTemplate(userApi, namespace, modelIds);
  // Load from disk if exists.
  const location = path.resolve(TRANSLATIONS_PATH, languageCode, `${namespace}.json`);
  const isStatic = fs.existsSync(location);

  const safeJsonParse = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error(`Error parsing JSON: ${error}`);
      return {};
    }
  };

  const staticOverride = isStatic ? safeJsonParse(fs.readFileSync(location).toString()) : {};

  // Load from config if exists.
  const loadedConfig = await loadLocalisationConfiguration(userApi, namespace, siteId);
  const config = loadedConfig.config;
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

  const loadedConfig = await loadLocalisationConfiguration(userApi, namespace, siteId);

  const newConfiguration: LocalisationSiteConfig = {
    ...defaultSiteLocalisationSiteConfig,
    ...loadedConfig.config,
  };

  if (typeof changes.displayLanguages !== 'undefined') {
    newConfiguration.displayLanguages = changes.displayLanguages;
  }

  if (typeof changes.contentLanguages !== 'undefined') {
    newConfiguration.contentLanguages = changes.contentLanguages;
  }

  await saveLocalisationConfiguration(userApi, namespace, siteId, newConfiguration, loadedConfig.primaryResponse);

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
        ).map((m: { capture_model_id: string }) => m.capture_model_id)
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
  const loadedConfig = await loadLocalisationConfiguration(userApi, namespace, siteId);
  const newConfiguration: LocalisationSiteConfig = {
    ...defaultSiteLocalisationSiteConfig,
    ...loadedConfig.config,
    availableLanguages: {
      ...loadedConfig.config.availableLanguages,
      [languageCode]: {
        url,
        remote: false,
      },
    },
  };

  await saveLocalisationConfiguration(userApi, namespace, siteId, newConfiguration, loadedConfig.primaryResponse);

  context.response.status = 201;
  context.response.body = {
    code: languageCode,
    percentage: calculateTranslationProgress(validStrings),
    content: validStrings,
  };
};
