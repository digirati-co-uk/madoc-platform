export type ConfigSnapshot = {
  id: string;
  scope_key: string;
  service: string;
  scope: string[];
  config_object: Record<string, unknown>;
  created: string;
  modified: string;
};

export type VersionedConfig = {
  version_id: number;
  scope_key: string;
  serialized_data: string;
  snapshot: ConfigSnapshot;
  modified: string;
};

export type ConfigRow = {
  id: string;
  scope_key: string;
  service: string;
  scope: string[];
  config_object: Record<string, unknown>;
  created: Date;
  modified: Date;
  version: number;
};

export type AddConfigPayload = {
  service: string;
  config_context: string[];
  config_data: Record<string, unknown>;
  scope_key?: string;
};

export interface ConfigRepositoryLike {
  findById(identifier: string, contextUrn: string | null): Promise<ConfigRow | null>;
  findByScopeKey(scopeKey: string, contextUrn: string | null): Promise<ConfigRow | null>;
  findExistingScope(scopeKey: string): Promise<ConfigRow | null>;
  create(payload: AddConfigPayload): Promise<ConfigRow>;
  updateConfig(config: ConfigRow, configObject: Record<string, unknown>): Promise<ConfigRow>;
  writeVersion(
    scopeKey: string,
    snapshot: ConfigSnapshot,
    serializedData: string,
    modified: string,
    explicitVersionId?: number
  ): Promise<VersionedConfig>;
  updateCurrentVersion(scopeKey: string, versionId: number): Promise<void>;
  getLatestVersion(scopeKey: string): Promise<VersionedConfig | null>;
  getVersion(scopeKey: string, versionId: number): Promise<VersionedConfig | null>;
  getVersionAtTime(scopeKey: string, dateTime: Date): Promise<VersionedConfig | null>;
  getAllVersions(scopeKey: string): Promise<Array<Record<string, unknown>>>;
  listByScopeKeys(scopeKeys: string[], service: string, contextUrn: string | null): Promise<ConfigRow[]>;
  listIdsByScopePrefix(scopePrefix: string): Promise<string[]>;
}
