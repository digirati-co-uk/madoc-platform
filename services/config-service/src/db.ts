import { Pool, PoolClient } from 'pg';
import { randomUUID } from 'node:crypto';

import { appConfig } from './config.js';
import type { AddConfigPayload, ConfigRow, ConfigSnapshot, VersionedConfig } from './types.js';

type LegacyVersionRow = {
  version_id: number;
  scope_key: string;
  serialized_data: string;
  date_created: Date;
};

function toDate(value: unknown, fallback: Date): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback;
}

function toConfigSnapshot(value: unknown, fallback: ConfigSnapshot): ConfigSnapshot {
  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const candidate = value as Partial<ConfigSnapshot>;
  const scope = Array.isArray(candidate.scope) ? candidate.scope.map(String) : fallback.scope;
  const configObject =
    candidate.config_object && typeof candidate.config_object === 'object'
      ? (candidate.config_object as Record<string, unknown>)
      : fallback.config_object;

  return {
    id: candidate.id ? String(candidate.id) : fallback.id,
    scope_key: candidate.scope_key ? String(candidate.scope_key) : fallback.scope_key,
    service: candidate.service ? String(candidate.service) : fallback.service,
    scope,
    config_object: configObject,
    created: candidate.created ? String(candidate.created) : fallback.created,
    modified: candidate.modified ? String(candidate.modified) : fallback.modified,
  };
}

export class ConfigRepository {
  private readonly pool: Pool;
  private readonly schemaName: string;
  private readonly schemaRef: string;

  constructor() {
    this.schemaName = appConfig.postgresSchema;
    this.schemaRef = `"${this.schemaName}"`;

    this.pool = new Pool({
      host: appConfig.postgresHost,
      port: appConfig.postgresPort,
      user: appConfig.postgresUser,
      password: appConfig.postgresPassword,
      database: appConfig.postgresDatabase,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    this.pool.on('connect', client => {
      void client.query(`SET search_path TO ${this.schemaRef}, public`);
    });
  }

  private table(name: string): string {
    return `${this.schemaRef}.${name}`;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async waitUntilReady(retries: number, retryDelayMs: number): Promise<void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.pool.query('SELECT 1');
        return;
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Database connection failed');
  }

  async migrate(): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${this.schemaRef}`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS ${this.table('configurations')} (
          scope_key TEXT PRIMARY KEY,
          id UUID NOT NULL UNIQUE,
          service TEXT NOT NULL,
          scope TEXT[] NOT NULL,
          config_object JSONB NOT NULL,
          created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          version BIGINT NOT NULL DEFAULT 0
        )
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS configurations_service_idx
        ON ${this.table('configurations')} (service)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS configurations_scope_gin_idx
        ON ${this.table('configurations')} USING GIN (scope)
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS ${this.table('config_versions')} (
          version_id BIGSERIAL PRIMARY KEY,
          scope_key TEXT NOT NULL REFERENCES ${this.table('configurations')} (scope_key) ON DELETE CASCADE,
          snapshot JSONB NOT NULL,
          serialized_data TEXT NOT NULL,
          modified TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS config_versions_scope_key_idx
        ON ${this.table('config_versions')} (scope_key)
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS config_versions_scope_key_modified_idx
        ON ${this.table('config_versions')} (scope_key, modified DESC)
      `);

      await this.importLegacyData(client);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async tableExists(client: PoolClient, tableName: string): Promise<boolean> {
    const result = await client.query<{ exists: boolean }>(
      `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = $1
          AND table_name = $2
      ) AS exists
    `,
      [this.schemaName, tableName]
    );

    return result.rows[0]?.exists === true;
  }

  private async importLegacyData(client: PoolClient): Promise<void> {
    const newTableCount = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM ${this.table('configurations')}`
    );

    if (Number(newTableCount.rows[0]?.count ?? '0') > 0) {
      return;
    }

    const legacyConfigTable = 'configurator_testconfiguuidscopekey';
    const hasLegacyConfig = await this.tableExists(client, legacyConfigTable);
    if (!hasLegacyConfig) {
      return;
    }

    const importedFromReversion = await this.importLegacyReversionHistory(client);
    if (!importedFromReversion) {
      await this.importLegacyCurrentRows(client, legacyConfigTable);
    }

    await client.query(`
      UPDATE ${this.table('configurations')} c
      SET version = versions.max_version
      FROM (
        SELECT scope_key, MAX(version_id) AS max_version
        FROM ${this.table('config_versions')}
        GROUP BY scope_key
      ) versions
      WHERE c.scope_key = versions.scope_key
    `);

    const relation = `${this.schemaName}.config_versions`;
    await client.query(`
      SELECT setval(
        pg_get_serial_sequence('${relation}', 'version_id'),
        COALESCE((SELECT MAX(version_id) FROM ${this.table('config_versions')}), 0) + 1,
        false
      )
    `);
  }

  private async importLegacyReversionHistory(client: PoolClient): Promise<boolean> {
    const hasVersionTable = await this.tableExists(client, 'reversion_version');
    const hasRevisionTable = await this.tableExists(client, 'reversion_revision');
    const hasContentTypeTable = await this.tableExists(client, 'django_content_type');

    if (!hasVersionTable || !hasRevisionTable || !hasContentTypeTable) {
      return false;
    }

    const contentType = await client.query<{ id: number }>(
      `
      SELECT id
      FROM ${this.table('django_content_type')}
      WHERE app_label = 'configurator'
        AND model = 'testconfiguuidscopekey'
      LIMIT 1
    `
    );

    if (contentType.rows.length === 0) {
      return false;
    }

    const contentTypeId = contentType.rows[0].id;
    const versions = await client.query<LegacyVersionRow>(
      `
      SELECT
        v.id::bigint AS version_id,
        v.object_id AS scope_key,
        v.serialized_data,
        r.date_created
      FROM ${this.table('reversion_version')} v
      INNER JOIN ${this.table('reversion_revision')} r
        ON v.revision_id = r.id
      WHERE v.content_type_id = $1
      ORDER BY v.id ASC
    `,
      [contentTypeId]
    );

    if (versions.rows.length === 0) {
      return false;
    }

    for (const row of versions.rows) {
      const fallbackDate = toDate(row.date_created, new Date());

      let parsed: unknown = null;
      try {
        parsed = JSON.parse(row.serialized_data);
      } catch {
        parsed = null;
      }

      const fieldsRaw =
        Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0]
          ? (parsed[0] as { fields?: unknown }).fields
          : null;

      const fields = fieldsRaw && typeof fieldsRaw === 'object' ? (fieldsRaw as Record<string, unknown>) : {};

      const scope = Array.isArray(fields.scope) ? fields.scope.map(String) : [];
      const configObject =
        fields.config_object && typeof fields.config_object === 'object'
          ? (fields.config_object as Record<string, unknown>)
          : {};

      const scopeKey = typeof fields.scope_key === 'string' ? fields.scope_key : row.scope_key;
      const id = typeof fields.id === 'string' ? fields.id : randomUUID();
      const service = typeof fields.service === 'string' ? fields.service : 'unknown';

      const created = toDate(fields.created, fallbackDate);
      const modified = toDate(fields.modified, fallbackDate);

      const snapshot: ConfigSnapshot = {
        id,
        scope_key: scopeKey,
        service,
        scope,
        config_object: configObject,
        created: created.toISOString(),
        modified: modified.toISOString(),
      };

      await client.query(
        `
        INSERT INTO ${this.table('configurations')} (
          scope_key,
          id,
          service,
          scope,
          config_object,
          created,
          modified,
          version
        ) VALUES ($1, $2::uuid, $3, $4::text[], $5::jsonb, $6::timestamptz, $7::timestamptz, $8)
        ON CONFLICT (scope_key) DO UPDATE SET
          id = EXCLUDED.id,
          service = EXCLUDED.service,
          scope = EXCLUDED.scope,
          config_object = EXCLUDED.config_object,
          created = EXCLUDED.created,
          modified = EXCLUDED.modified,
          version = EXCLUDED.version
      `,
        [scopeKey, id, service, scope, JSON.stringify(configObject), created, modified, row.version_id]
      );

      await client.query(
        `
        INSERT INTO ${this.table('config_versions')} (
          version_id,
          scope_key,
          snapshot,
          serialized_data,
          modified
        ) VALUES ($1, $2, $3::jsonb, $4, $5::timestamptz)
        ON CONFLICT (version_id) DO NOTHING
      `,
        [row.version_id, scopeKey, JSON.stringify(snapshot), row.serialized_data, modified]
      );
    }

    return true;
  }

  private async importLegacyCurrentRows(client: PoolClient, legacyTable: string): Promise<void> {
    const rows = await client.query<{
      scope_key: string;
      id: string;
      service: string;
      scope: string[];
      config_object: Record<string, unknown>;
      created: Date;
      modified: Date;
    }>(
      `
      SELECT scope_key, id::text AS id, service, scope, config_object, created, modified
      FROM ${this.table(legacyTable)}
      ORDER BY service ASC
    `
    );

    for (const row of rows.rows) {
      const created = toDate(row.created, new Date());
      const modified = toDate(row.modified, created);

      await client.query(
        `
        INSERT INTO ${this.table('configurations')} (
          scope_key,
          id,
          service,
          scope,
          config_object,
          created,
          modified,
          version
        ) VALUES ($1, $2::uuid, $3, $4::text[], $5::jsonb, $6::timestamptz, $7::timestamptz, 0)
        ON CONFLICT (scope_key) DO NOTHING
      `,
        [row.scope_key, row.id, row.service, row.scope, JSON.stringify(row.config_object), created, modified]
      );

      const snapshot: ConfigSnapshot = {
        id: row.id,
        scope_key: row.scope_key,
        service: row.service,
        scope: row.scope,
        config_object: row.config_object,
        created: created.toISOString(),
        modified: modified.toISOString(),
      };

      const insertedVersion = await client.query<{ version_id: number }>(
        `
        INSERT INTO ${this.table('config_versions')} (
          scope_key,
          snapshot,
          serialized_data,
          modified
        ) VALUES ($1, $2::jsonb, $3, $4::timestamptz)
        RETURNING version_id
      `,
        [row.scope_key, JSON.stringify(snapshot), JSON.stringify(snapshot), modified]
      );

      const versionId = insertedVersion.rows[0]?.version_id ?? 0;

      await client.query(
        `
        UPDATE ${this.table('configurations')}
        SET version = $2
        WHERE scope_key = $1
      `,
        [row.scope_key, versionId]
      );
    }
  }

  private mapConfigRow(row: ConfigRow): ConfigRow {
    return {
      ...row,
      created: toDate(row.created, new Date()),
      modified: toDate(row.modified, new Date()),
      config_object:
        row.config_object && typeof row.config_object === 'object'
          ? row.config_object
          : ({} as Record<string, unknown>),
      scope: Array.isArray(row.scope) ? row.scope.map(String) : [],
    };
  }

  private mapVersionedRow(row: VersionedConfig): VersionedConfig {
    const fallbackSnapshot: ConfigSnapshot = {
      id: '',
      scope_key: row.scope_key,
      service: '',
      scope: [],
      config_object: {},
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    };

    const snapshot = toConfigSnapshot(row.snapshot, fallbackSnapshot);

    return {
      version_id: Number(row.version_id),
      scope_key: String(row.scope_key),
      serialized_data: String(row.serialized_data),
      snapshot,
      modified: toDate(row.modified, new Date()).toISOString(),
    };
  }

  async findById(identifier: string, contextUrn: string | null): Promise<ConfigRow | null> {
    if (!contextUrn) {
      return null;
    }

    const result = await this.pool.query<ConfigRow>(
      `
      SELECT id::text AS id, scope_key, service, scope, config_object, created, modified, version
      FROM ${this.table('configurations')}
      WHERE id = $1::uuid
        AND scope @> ARRAY[$2]::text[]
      LIMIT 1
    `,
      [identifier, contextUrn]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapConfigRow(result.rows[0]);
  }

  async findByScopeKey(scopeKey: string, contextUrn: string | null): Promise<ConfigRow | null> {
    if (!contextUrn) {
      return null;
    }

    const result = await this.pool.query<ConfigRow>(
      `
      SELECT id::text AS id, scope_key, service, scope, config_object, created, modified, version
      FROM ${this.table('configurations')}
      WHERE scope_key = $1
        AND scope @> ARRAY[$2]::text[]
      LIMIT 1
    `,
      [scopeKey, contextUrn]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapConfigRow(result.rows[0]);
  }

  async findExistingScope(scopeKey: string): Promise<ConfigRow | null> {
    const result = await this.pool.query<ConfigRow>(
      `
      SELECT id::text AS id, scope_key, service, scope, config_object, created, modified, version
      FROM ${this.table('configurations')}
      WHERE scope_key = $1
      LIMIT 1
    `,
      [scopeKey]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapConfigRow(result.rows[0]);
  }

  async create(payload: AddConfigPayload): Promise<ConfigRow> {
    const id = randomUUID();
    const now = new Date();

    const created = await this.pool.query<ConfigRow>(
      `
      INSERT INTO ${this.table('configurations')} (
        scope_key,
        id,
        service,
        scope,
        config_object,
        created,
        modified,
        version
      ) VALUES ($1, $2::uuid, $3, $4::text[], $5::jsonb, $6::timestamptz, $7::timestamptz, 0)
      RETURNING id::text AS id, scope_key, service, scope, config_object, created, modified, version
    `,
      [payload.scope_key, id, payload.service, payload.config_context, JSON.stringify(payload.config_data), now, now]
    );

    return this.mapConfigRow(created.rows[0]);
  }

  async updateConfig(config: ConfigRow, configObject: Record<string, unknown>): Promise<ConfigRow> {
    const updated = await this.pool.query<ConfigRow>(
      `
      UPDATE ${this.table('configurations')}
      SET config_object = $2::jsonb,
          modified = NOW()
      WHERE scope_key = $1
      RETURNING id::text AS id, scope_key, service, scope, config_object, created, modified, version
    `,
      [config.scope_key, JSON.stringify(configObject)]
    );

    return this.mapConfigRow(updated.rows[0]);
  }

  async writeVersion(
    scopeKey: string,
    snapshot: ConfigSnapshot,
    serializedData: string,
    modified: string,
    explicitVersionId?: number
  ): Promise<VersionedConfig> {
    const query = explicitVersionId
      ? `
        INSERT INTO ${this.table('config_versions')} (
          version_id,
          scope_key,
          snapshot,
          serialized_data,
          modified
        ) VALUES ($1, $2, $3::jsonb, $4, $5::timestamptz)
        RETURNING version_id, scope_key, snapshot, serialized_data, modified
      `
      : `
        INSERT INTO ${this.table('config_versions')} (
          scope_key,
          snapshot,
          serialized_data,
          modified
        ) VALUES ($1, $2::jsonb, $3, $4::timestamptz)
        RETURNING version_id, scope_key, snapshot, serialized_data, modified
      `;

    const params = explicitVersionId
      ? [explicitVersionId, scopeKey, JSON.stringify(snapshot), serializedData, modified]
      : [scopeKey, JSON.stringify(snapshot), serializedData, modified];

    const result = await this.pool.query<VersionedConfig>(query, params);
    return this.mapVersionedRow(result.rows[0]);
  }

  async updateCurrentVersion(scopeKey: string, versionId: number): Promise<void> {
    await this.pool.query(`UPDATE ${this.table('configurations')} SET version = $2 WHERE scope_key = $1`, [
      scopeKey,
      versionId,
    ]);
  }

  async getLatestVersion(scopeKey: string): Promise<VersionedConfig | null> {
    const result = await this.pool.query<VersionedConfig>(
      `
      SELECT version_id, scope_key, snapshot, serialized_data, modified
      FROM ${this.table('config_versions')}
      WHERE scope_key = $1
      ORDER BY version_id DESC
      LIMIT 1
    `,
      [scopeKey]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapVersionedRow(result.rows[0]);
  }

  async getVersion(scopeKey: string, versionId: number): Promise<VersionedConfig | null> {
    const result = await this.pool.query<VersionedConfig>(
      `
      SELECT version_id, scope_key, snapshot, serialized_data, modified
      FROM ${this.table('config_versions')}
      WHERE scope_key = $1
        AND version_id = $2
      LIMIT 1
    `,
      [scopeKey, versionId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapVersionedRow(result.rows[0]);
  }

  async getVersionAtTime(scopeKey: string, dateTime: Date): Promise<VersionedConfig | null> {
    const result = await this.pool.query<VersionedConfig>(
      `
      SELECT version_id, scope_key, snapshot, serialized_data, modified
      FROM ${this.table('config_versions')}
      WHERE scope_key = $1
        AND modified <= $2::timestamptz
      ORDER BY modified DESC, version_id DESC
      LIMIT 1
    `,
      [scopeKey, dateTime.toISOString()]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapVersionedRow(result.rows[0]);
  }

  async getAllVersions(scopeKey: string): Promise<Array<Record<string, unknown>>> {
    const result = await this.pool.query<VersionedConfig>(
      `
      SELECT version_id, scope_key, snapshot, serialized_data, modified
      FROM ${this.table('config_versions')}
      WHERE scope_key = $1
      ORDER BY modified DESC, version_id DESC
    `,
      [scopeKey]
    );

    return result.rows.map(raw => {
      const version = this.mapVersionedRow(raw);
      return {
        ...version.snapshot,
        version_id: version.version_id,
      };
    });
  }

  async listByScopeKeys(scopeKeys: string[], service: string, contextUrn: string | null): Promise<ConfigRow[]> {
    if (!contextUrn || scopeKeys.length === 0) {
      return [];
    }

    const result = await this.pool.query<ConfigRow>(
      `
      SELECT id::text AS id, scope_key, service, scope, config_object, created, modified, version
      FROM ${this.table('configurations')}
      WHERE scope_key = ANY($1::text[])
        AND service = $2
        AND scope @> ARRAY[$3]::text[]
    `,
      [scopeKeys, service, contextUrn]
    );

    return result.rows.map(row => this.mapConfigRow(row));
  }

  async listIdsByScopePrefix(scopePrefix: string): Promise<string[]> {
    const result = await this.pool.query<{ id: string }>(
      `
      SELECT id::text AS id
      FROM ${this.table('configurations')}
      WHERE scope_key LIKE $1
      ORDER BY service ASC
    `,
      [`${scopePrefix}%`]
    );

    return result.rows.map(row => row.id);
  }
}
