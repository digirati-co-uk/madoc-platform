import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

import { appConfig } from './config.js';
import { genKey, iterateSeparatedKeylist } from './scope.js';
import type { AddConfigPayload, ConfigRepositoryLike, ConfigRow, ConfigSnapshot, VersionedConfig } from './types.js';
import { validateDataFile } from './validation.js';

export type AddConfigResult = {
  valid: boolean;
  err: number | string | null;
  obj: Record<string, unknown> | null;
};

export type RestfulPutResult = {
  err: number | string | null;
  existing: ConfigRow | null;
};

export type QueryInput = {
  identifier?: string | null;
  scopeList?: string[] | null;
  service?: string | null;
  scopeKey?: string | null;
  versionId?: string | null;
  atTime?: string | null;
  contextUrn?: string | null;
};

function parseDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

export class ConfigService {
  constructor(private readonly repository: ConfigRepositoryLike) {}

  private configRowToDict(row: ConfigRow): Record<string, unknown> {
    return {
      id: row.id,
      scope_key: row.scope_key,
      service: row.service,
      scope: row.scope,
      config_object: row.config_object,
      created: row.created.toISOString(),
      modified: row.modified.toISOString(),
    };
  }

  private toSnapshot(row: ConfigRow): ConfigSnapshot {
    return {
      id: row.id,
      scope_key: row.scope_key,
      service: row.service,
      scope: row.scope,
      config_object: row.config_object,
      created: row.created.toISOString(),
      modified: row.modified.toISOString(),
    };
  }

  private serializeSnapshot(snapshot: ConfigSnapshot): string {
    return JSON.stringify([
      {
        model: 'configurator.testconfiguuidscopekey',
        pk: snapshot.scope_key,
        fields: {
          id: snapshot.id,
          scope_key: snapshot.scope_key,
          service: snapshot.service,
          scope: snapshot.scope,
          config_object: snapshot.config_object,
          created: snapshot.created,
          modified: snapshot.modified,
        },
      },
    ]);
  }

  generateEtag(versionedConfig: VersionedConfig | null): string | undefined {
    if (!versionedConfig) {
      return undefined;
    }

    return createHash('blake2b512').update(versionedConfig.serialized_data, 'utf8').digest('hex');
  }

  async serviceFallback(service: string): Promise<Array<Record<string, unknown>>> {
    const fallbackPath = path.join(appConfig.defaultsPath, `${service}.json`);

    try {
      const contents = await fs.readFile(fallbackPath, 'utf8');
      const configObject = JSON.parse(contents) as Record<string, unknown>;

      return [
        {
          id: null,
          scope_key: 'global',
          scope: ['global'],
          service,
          config_object: configObject,
        },
      ];
    } catch {
      return [];
    }
  }

  private async resolveConfigByIdentifierOrScope(
    identifier: string | null | undefined,
    scopeKey: string | null | undefined,
    contextUrn: string | null | undefined
  ): Promise<ConfigRow | null> {
    if (identifier) {
      return this.repository.findById(identifier, contextUrn ?? null);
    }

    if (scopeKey) {
      return this.repository.findByScopeKey(scopeKey, contextUrn ?? null);
    }

    return null;
  }

  async getVersionedConfig(
    identifier: string | null | undefined,
    scopeKey: string | null | undefined,
    version: number | null,
    contextUrn: string | null | undefined
  ): Promise<VersionedConfig | null> {
    const config = await this.resolveConfigByIdentifierOrScope(identifier, scopeKey, contextUrn);
    if (!config) {
      return null;
    }

    if (version !== null) {
      return this.repository.getVersion(config.scope_key, version);
    }

    return this.repository.getLatestVersion(config.scope_key);
  }

  async getTimedVersionedConfig(
    identifier: string,
    dateTime: Date,
    contextUrn: string | null | undefined
  ): Promise<VersionedConfig | null> {
    const config = await this.repository.findById(identifier, contextUrn ?? null);
    if (!config) {
      return null;
    }

    return this.repository.getVersionAtTime(config.scope_key, dateTime);
  }

  async getAllVersions(
    identifier: string | null | undefined,
    scopeKey: string | null | undefined,
    contextUrn: string | null | undefined
  ): Promise<Array<Record<string, unknown>> | null> {
    const config = await this.resolveConfigByIdentifierOrScope(identifier, scopeKey, contextUrn);
    if (!config) {
      return null;
    }

    return this.repository.getAllVersions(config.scope_key);
  }

  async restfulGetConfig(
    identifier: string,
    versionId: number | null,
    dateTime: Date | null,
    contextUrn: string | null | undefined
  ): Promise<[Record<string, unknown>, string] | null> {
    let versionedConfig: VersionedConfig | null;

    if (dateTime && versionId === null) {
      versionedConfig = await this.getTimedVersionedConfig(identifier, dateTime, contextUrn);
    } else {
      versionedConfig = await this.getVersionedConfig(identifier, null, versionId, contextUrn);
    }

    if (!versionedConfig) {
      return null;
    }

    const etag = this.generateEtag(versionedConfig);
    if (!etag) {
      return null;
    }

    return [
      {
        ...versionedConfig.snapshot.config_object,
        version_id: versionedConfig.version_id,
      },
      etag,
    ];
  }

  async restfulPutConfig(
    identifier: string,
    configObject: Record<string, unknown>,
    ifMatch: string,
    contextUrn: string | null | undefined
  ): Promise<RestfulPutResult> {
    const existingConfig = await this.repository.findById(identifier, contextUrn ?? null);

    if (!existingConfig) {
      return {
        err: null,
        existing: null,
      };
    }

    const versionedConfig = await this.repository.getLatestVersion(existingConfig.scope_key);
    const etag = this.generateEtag(versionedConfig);

    if (!etag || ifMatch !== etag) {
      return {
        err: 412,
        existing: existingConfig,
      };
    }

    const serviceValidation = await validateDataFile(configObject, existingConfig.service);
    if (!serviceValidation.valid) {
      return {
        err: serviceValidation.err,
        existing: existingConfig,
      };
    }

    const updated = await this.repository.updateConfig(existingConfig, configObject);
    const snapshot = this.toSnapshot(updated);
    const serializedData = this.serializeSnapshot(snapshot);
    const newVersion = await this.repository.writeVersion(updated.scope_key, snapshot, serializedData, snapshot.modified);
    await this.repository.updateCurrentVersion(updated.scope_key, newVersion.version_id);

    console.info('Config updated', {
      id: updated.id,
      service: updated.service,
      scope_key: updated.scope_key,
      version_id: newVersion.version_id,
      context_urn: contextUrn ?? null,
    });

    return {
      err: null,
      existing: updated,
    };
  }

  async addConfig(payload: AddConfigPayload, contextUrn: string | null | undefined): Promise<AddConfigResult> {
    if (!contextUrn) {
      return {
        valid: false,
        err: 403,
        obj: {},
      };
    }

    const baseValidation = await validateDataFile(payload, 'config_base');
    if (!baseValidation.valid) {
      return {
        valid: false,
        err: baseValidation.err,
        obj: null,
      };
    }

    const serviceValidation = await validateDataFile(payload.config_data, payload.service);
    if (!serviceValidation.valid) {
      return {
        valid: false,
        err: serviceValidation.err,
        obj: null,
      };
    }

    const scopeKey = genKey([...payload.config_context, payload.service], appConfig.globalSeparator);
    if (!scopeKey) {
      return {
        valid: false,
        err: 'Invalid config context',
        obj: null,
      };
    }

    const existing = await this.repository.findExistingScope(scopeKey);
    if (existing) {
      const visibleExisting = await this.repository.findById(existing.id, contextUrn);
      if (visibleExisting) {
        const versioned = await this.repository.getLatestVersion(visibleExisting.scope_key);
        if (versioned) {
          return {
            valid: false,
            err: 409,
            obj: {
              ...versioned.snapshot,
              version_id: versioned.version_id,
            },
          };
        }
      }

      return {
        valid: false,
        err: 409,
        obj: {
          id: existing.id,
        },
      };
    }

    const created = await this.repository.create({ ...payload, scope_key: scopeKey });
    const snapshot = this.toSnapshot(created);
    const serializedData = this.serializeSnapshot(snapshot);
    const version = await this.repository.writeVersion(scopeKey, snapshot, serializedData, snapshot.modified);
    await this.repository.updateCurrentVersion(scopeKey, version.version_id);

    return {
      valid: true,
      err: null,
      obj: this.configRowToDict(created),
    };
  }

  async getConfig(input: QueryInput): Promise<Array<Record<string, unknown>> | null> {
    const {
      identifier,
      scopeList,
      service,
      scopeKey,
      versionId,
      atTime: _atTime,
      contextUrn,
    } = input;

    let parsedVersion: number | null = null;

    if (versionId) {
      if (versionId !== 'all') {
        const parsed = Number(versionId);
        if (!Number.isInteger(parsed)) {
          return null;
        }
        parsedVersion = parsed;
      }
    }

    if (identifier || scopeKey) {
      if (versionId === 'all') {
        return this.getAllVersions(identifier, scopeKey, contextUrn);
      }

      const versionedConfig = await this.getVersionedConfig(identifier, scopeKey, parsedVersion, contextUrn);
      if (versionedConfig) {
        return [versionedConfig.snapshot as unknown as Record<string, unknown>];
      }

      if (service) {
        return this.serviceFallback(service);
      }

      return null;
    }

    if (scopeList && scopeList.length > 0) {
      if (service) {
        const scopeWithService = [...scopeList, service];
        const scopeKeys = iterateSeparatedKeylist(scopeWithService, appConfig.globalSeparator);

        const configList = scopeKeys
          ? await this.repository.listByScopeKeys(scopeKeys, service, contextUrn ?? null)
          : [];

        const sortedConfigList = [...configList].sort((a, b) => {
          if (!scopeKeys) {
            return 0;
          }
          return scopeKeys.indexOf(a.scope_key) - scopeKeys.indexOf(b.scope_key);
        });

        if (sortedConfigList.length > 0) {
          const existing = sortedConfigList[0];
          if (versionId === 'all') {
            return this.getAllVersions(existing.id, null, contextUrn);
          }

          const versioned = await this.getVersionedConfig(existing.id, null, parsedVersion, contextUrn);
          if (versioned) {
            return [
              {
                ...versioned.snapshot,
                version_id: versioned.version_id,
              },
            ];
          }
        }

        return this.serviceFallback(service);
      }

      const scopePrefix = genKey(scopeList, appConfig.globalSeparator);
      if (!scopePrefix) {
        return null;
      }

      const ids = await this.repository.listIdsByScopePrefix(scopePrefix);
      const versionedConfigList: Array<Record<string, unknown>> = [];

      for (const id of ids) {
        const versioned = await this.getVersionedConfig(id, null, null, contextUrn);
        if (versioned) {
          versionedConfigList.push({
            ...versioned.snapshot,
            version_id: versioned.version_id,
          });
        }
      }

      return versionedConfigList;
    }

    return null;
  }

  parseDateTime(value: string | null | undefined): Date | null {
    return parseDate(value);
  }
}
