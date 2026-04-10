import { randomUUID } from 'node:crypto';

import type { AddConfigPayload, ConfigRepositoryLike, ConfigRow, ConfigSnapshot, VersionedConfig } from '../../src/types.js';

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function toDate(value: string | Date): Date {
  if (value instanceof Date) {
    return value;
  }
  return new Date(value);
}

function cloneRow(row: ConfigRow): ConfigRow {
  return {
    ...row,
    scope: [...row.scope],
    config_object: deepClone(row.config_object),
    created: new Date(row.created),
    modified: new Date(row.modified),
  };
}

export class InMemoryConfigRepository implements ConfigRepositoryLike {
  private readonly configsByScope = new Map<string, ConfigRow>();
  private readonly versionsByScope = new Map<string, VersionedConfig[]>();
  private versionCounter = 1;

  private configVisibleInContext(config: ConfigRow, contextUrn: string | null): boolean {
    if (!contextUrn) {
      return false;
    }
    return config.scope.includes(contextUrn);
  }

  private saveConfig(row: ConfigRow): ConfigRow {
    this.configsByScope.set(row.scope_key, row);
    return cloneRow(row);
  }

  private getConfigById(identifier: string): ConfigRow | null {
    for (const config of this.configsByScope.values()) {
      if (config.id === identifier) {
        return config;
      }
    }
    return null;
  }

  async findById(identifier: string, contextUrn: string | null): Promise<ConfigRow | null> {
    const config = this.getConfigById(identifier);
    if (!config || !this.configVisibleInContext(config, contextUrn)) {
      return null;
    }
    return cloneRow(config);
  }

  async findByScopeKey(scopeKey: string, contextUrn: string | null): Promise<ConfigRow | null> {
    const config = this.configsByScope.get(scopeKey);
    if (!config || !this.configVisibleInContext(config, contextUrn)) {
      return null;
    }
    return cloneRow(config);
  }

  async findExistingScope(scopeKey: string): Promise<ConfigRow | null> {
    const config = this.configsByScope.get(scopeKey);
    return config ? cloneRow(config) : null;
  }

  async create(payload: AddConfigPayload): Promise<ConfigRow> {
    const now = new Date();
    const row: ConfigRow = {
      id: randomUUID(),
      scope_key: payload.scope_key || '',
      service: payload.service,
      scope: [...payload.config_context],
      config_object: deepClone(payload.config_data),
      created: now,
      modified: now,
      version: 0,
    };
    return this.saveConfig(row);
  }

  async updateConfig(config: ConfigRow, configObject: Record<string, unknown>): Promise<ConfigRow> {
    const now = new Date();
    const existing = this.configsByScope.get(config.scope_key);
    if (!existing) {
      throw new Error(`Unknown config scope key: ${config.scope_key}`);
    }
    const updated: ConfigRow = {
      ...existing,
      config_object: deepClone(configObject),
      modified: now,
    };
    return this.saveConfig(updated);
  }

  async writeVersion(
    scopeKey: string,
    snapshot: ConfigSnapshot,
    serializedData: string,
    modified: string,
    explicitVersionId?: number
  ): Promise<VersionedConfig> {
    const versions = this.versionsByScope.get(scopeKey) || [];
    const versionId = explicitVersionId ?? this.versionCounter++;

    if (explicitVersionId && explicitVersionId >= this.versionCounter) {
      this.versionCounter = explicitVersionId + 1;
    }

    const version: VersionedConfig = {
      version_id: versionId,
      scope_key: scopeKey,
      serialized_data: serializedData,
      snapshot: deepClone(snapshot),
      modified,
    };

    versions.push(version);
    this.versionsByScope.set(scopeKey, versions);
    return deepClone(version);
  }

  async updateCurrentVersion(scopeKey: string, versionId: number): Promise<void> {
    const existing = this.configsByScope.get(scopeKey);
    if (!existing) {
      return;
    }
    existing.version = versionId;
    this.configsByScope.set(scopeKey, existing);
  }

  async getLatestVersion(scopeKey: string): Promise<VersionedConfig | null> {
    const versions = this.versionsByScope.get(scopeKey) || [];
    if (versions.length === 0) {
      return null;
    }
    const sorted = [...versions].sort((a, b) => b.version_id - a.version_id);
    return deepClone(sorted[0]);
  }

  async getVersion(scopeKey: string, versionId: number): Promise<VersionedConfig | null> {
    const versions = this.versionsByScope.get(scopeKey) || [];
    const version = versions.find(v => v.version_id === versionId);
    return version ? deepClone(version) : null;
  }

  async getVersionAtTime(scopeKey: string, dateTime: Date): Promise<VersionedConfig | null> {
    const versions = this.versionsByScope.get(scopeKey) || [];
    const matching = versions
      .filter(version => toDate(version.modified).getTime() <= dateTime.getTime())
      .sort((a, b) => {
        const timeDiff = toDate(b.modified).getTime() - toDate(a.modified).getTime();
        return timeDiff || b.version_id - a.version_id;
      });

    if (matching.length === 0) {
      return null;
    }
    return deepClone(matching[0]);
  }

  async getAllVersions(scopeKey: string): Promise<Array<Record<string, unknown>>> {
    const versions = this.versionsByScope.get(scopeKey) || [];
    return [...versions]
      .sort((a, b) => {
        const timeDiff = toDate(b.modified).getTime() - toDate(a.modified).getTime();
        return timeDiff || b.version_id - a.version_id;
      })
      .map(version => ({
        ...deepClone(version.snapshot),
        version_id: version.version_id,
      }));
  }

  async listByScopeKeys(scopeKeys: string[], service: string, contextUrn: string | null): Promise<ConfigRow[]> {
    if (!contextUrn || scopeKeys.length === 0) {
      return [];
    }

    const scopeSet = new Set(scopeKeys);
    const rows: ConfigRow[] = [];

    for (const config of this.configsByScope.values()) {
      if (scopeSet.has(config.scope_key) && config.service === service && config.scope.includes(contextUrn)) {
        rows.push(cloneRow(config));
      }
    }

    return rows;
  }

  async listIdsByScopePrefix(scopePrefix: string): Promise<string[]> {
    const matching = [...this.configsByScope.values()]
      .filter(config => config.scope_key.startsWith(scopePrefix))
      .sort((a, b) => a.service.localeCompare(b.service));

    return matching.map(config => config.id);
  }
}
