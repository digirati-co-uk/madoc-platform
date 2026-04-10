#!/usr/bin/env node

import process from 'node:process';
import { randomUUID } from 'node:crypto';

const TABULAR_CELL_FLAGS_PROPERTY = '__tabularCellFlags';

function printHelp() {
  console.log(`
One-off migration: convert legacy tabular capture models (column-first) to row-first shape.

Usage:
  node tools/migrate-tabular-capture-models.mjs \\
    --base-url https://madoc.dlcs.digirati.io \\
    --slug default \\
    [--token <jwt>] \\
    [--client-id <client_id>] \\
    [--client-secret <client_secret>] \\
    [--site-id <site_id>] \\
    [--project-id <project_id>] \\
    [--project-id <project_id>] \\
    [--include-non-tabular] \\
    [--apply]

Defaults:
  - Dry-run mode is enabled by default (no PUT writes).
  - Only projects with template "tabular-project" are migrated by default.

Environment variable alternatives:
  MADOC_BASE_URL
  MADOC_SLUG
  MADOC_TOKEN
  MADOC_CLIENT_ID
  MADOC_CLIENT_SECRET
  MADOC_SITE_ID

Examples:
  Dry run with existing token:
    node tools/migrate-tabular-capture-models.mjs \\
      --base-url https://madoc.dlcs.digirati.io \\
      --slug default \\
      --token <jwt> \\
      --project-id 43

  Dry run all tabular projects:
    node tools/migrate-tabular-capture-models.mjs \\
      --base-url https://madoc.dlcs.digirati.io \\
      --slug default \\
      --client-id abc \\
      --client-secret xyz

  Apply migration to project 43 only:
    node tools/migrate-tabular-capture-models.mjs \\
      --base-url https://madoc.dlcs.digirati.io \\
      --slug default \\
      --client-id abc \\
      --client-secret xyz \\
      --project-id 43 \\
      --apply
`);
}

function parseArgs(argv) {
  const options = {
    baseUrl: process.env.MADOC_BASE_URL || '',
    slug: process.env.MADOC_SLUG || '',
    token: process.env.MADOC_TOKEN || '',
    clientId: process.env.MADOC_CLIENT_ID || '',
    clientSecret: process.env.MADOC_CLIENT_SECRET || '',
    siteId: process.env.MADOC_SITE_ID || '',
    projectIds: [],
    apply: false,
    includeNonTabular: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--apply') {
      options.apply = true;
      continue;
    }

    if (arg === '--include-non-tabular') {
      options.includeNonTabular = true;
      continue;
    }

    const next = argv[index + 1];

    if ((arg === '--base-url' || arg === '--baseUrl') && typeof next === 'string') {
      options.baseUrl = next;
      index += 1;
      continue;
    }

    if (arg === '--slug' && typeof next === 'string') {
      options.slug = next;
      index += 1;
      continue;
    }

    if (arg === '--token' && typeof next === 'string') {
      options.token = next;
      index += 1;
      continue;
    }

    if ((arg === '--client-id' || arg === '--clientId') && typeof next === 'string') {
      options.clientId = next;
      index += 1;
      continue;
    }

    if ((arg === '--client-secret' || arg === '--clientSecret') && typeof next === 'string') {
      options.clientSecret = next;
      index += 1;
      continue;
    }

    if ((arg === '--site-id' || arg === '--siteId') && typeof next === 'string') {
      options.siteId = next;
      index += 1;
      continue;
    }

    if ((arg === '--project-id' || arg === '--projectId') && typeof next === 'string') {
      options.projectIds.push(next);
      index += 1;
      continue;
    }

    throw new Error(`Unknown or incomplete argument: ${arg}`);
  }

  return options;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isEntity(value) {
  return isObject(value) && value.type === 'entity' && isObject(value.properties);
}

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4 || 4)) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalizeScope(scopeValue) {
  if (Array.isArray(scopeValue)) {
    return scopeValue.filter(item => typeof item === 'string' && item.trim());
  }

  if (typeof scopeValue === 'string' && scopeValue.trim()) {
    return scopeValue
      .split(/\s+/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
}

function unique(values) {
  return Array.from(new Set(values));
}

function normalizeStructureFields(fields, rowColumns) {
  if (!Array.isArray(fields)) {
    return fields;
  }

  const hasRowsTuple = fields.some(item => Array.isArray(item) && item[0] === 'rows');
  if (hasRowsTuple) {
    return fields;
  }

  const rowColumnSet = new Set(rowColumns);
  const rowFieldKeys = fields.filter(item => typeof item === 'string' && rowColumnSet.has(item));

  const normalized = [];

  if (rowFieldKeys.length) {
    normalized.push(['rows', rowFieldKeys]);
  }

  for (const field of fields) {
    if (typeof field === 'string') {
      if (rowColumnSet.has(field)) {
        continue;
      }

      normalized.push(field);
      continue;
    }

    normalized.push(field);
  }

  return normalized;
}

function normalizeStructure(structure, rowColumns) {
  if (!isObject(structure)) {
    return structure;
  }

  if (structure.type === 'choice' && Array.isArray(structure.items)) {
    structure.items = structure.items.map(item => normalizeStructure(item, rowColumns));
    return structure;
  }

  if (structure.type === 'model') {
    structure.fields = normalizeStructureFields(structure.fields, rowColumns);
  }

  return structure;
}

function getLegacyRowColumns(model) {
  if (!isObject(model) || !isObject(model.document) || !isObject(model.document.properties)) {
    return [];
  }

  const properties = model.document.properties;

  const existingRows = properties.rows;
  if (Array.isArray(existingRows) && existingRows.some(isEntity)) {
    return [];
  }

  const structureColumns = [];

  const collect = structure => {
    if (!isObject(structure)) {
      return;
    }

    if (structure.type === 'choice' && Array.isArray(structure.items)) {
      for (const item of structure.items) {
        collect(item);
      }
      return;
    }

    if (structure.type !== 'model' || !Array.isArray(structure.fields)) {
      return;
    }

    const hasRowsTuple = structure.fields.some(field => Array.isArray(field) && field[0] === 'rows');
    if (hasRowsTuple) {
      return;
    }

    for (const field of structure.fields) {
      if (typeof field !== 'string') {
        continue;
      }

      if (field === TABULAR_CELL_FLAGS_PROPERTY || field === 'rows') {
        continue;
      }

      structureColumns.push(field);
    }
  };

  collect(model.structure);

  const fromStructure = unique(structureColumns).filter(key => {
    const value = properties[key];
    return Array.isArray(value) && !value.some(isEntity);
  });

  if (fromStructure.length) {
    return fromStructure;
  }

  return Object.entries(properties)
    .filter(([key, value]) => {
      if (key === TABULAR_CELL_FLAGS_PROPERTY || key === 'rows') {
        return false;
      }

      return Array.isArray(value) && !value.some(isEntity);
    })
    .map(([key]) => key);
}

function mapLegacyColumnsToRows(document, rowColumns) {
  const properties = document.properties || {};
  const columnLists = {};

  for (const columnKey of rowColumns) {
    const values = Array.isArray(properties[columnKey]) ? properties[columnKey] : [];
    columnLists[columnKey] = values.filter(value => !isEntity(value));
  }

  const rowCount = rowColumns.reduce((max, key) => Math.max(max, columnLists[key].length), 0);
  const rows = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const rowProperties = {};
    let rowRevision;

    for (const columnKey of rowColumns) {
      const field = columnLists[columnKey][rowIndex];
      if (!field || isEntity(field)) {
        continue;
      }

      rowProperties[columnKey] = [field];

      if (!rowRevision && typeof field.revision === 'string' && field.revision) {
        rowRevision = field.revision;
      }
    }

    if (!Object.keys(rowProperties).length) {
      continue;
    }

    const row = {
      id: randomUUID(),
      type: 'entity',
      label: 'Tabular row',
      properties: rowProperties,
      allowMultiple: true,
    };

    if (rowRevision) {
      row.revision = rowRevision;
    }

    rows.push(row);
  }

  const nextProperties = {};
  for (const [key, value] of Object.entries(properties)) {
    if (rowColumns.includes(key)) {
      continue;
    }

    nextProperties[key] = value;
  }

  nextProperties.rows = rows;

  return {
    ...document,
    properties: nextProperties,
  };
}

function migrateCaptureModelToRowShape(captureModel) {
  const rowColumns = getLegacyRowColumns(captureModel);

  if (!rowColumns.length) {
    return { changed: false, reason: 'already-row-based-or-not-tabular', rowColumns: [] };
  }

  const migrated = structuredClone(captureModel);

  migrated.document = mapLegacyColumnsToRows(migrated.document, rowColumns);
  migrated.structure = normalizeStructure(migrated.structure, rowColumns);

  if (Array.isArray(migrated.revisions)) {
    migrated.revisions = migrated.revisions.map(revision => {
      if (!isObject(revision) || !Array.isArray(revision.fields)) {
        return revision;
      }

      return {
        ...revision,
        fields: normalizeStructureFields(revision.fields, rowColumns),
      };
    });
  }

  return { changed: true, captureModel: migrated, rowColumns };
}

async function requestJson({ baseUrl, path, method = 'GET', token, body }) {
  const url = `${baseUrl}${path}`;

  const headers = {
    accept: 'application/json',
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers['content-type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let parsed = null;

  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      const contentType = response.headers.get('content-type') || 'unknown';
      const preview = text.slice(0, 200).replace(/\s+/g, ' ');
      throw new Error(
        `Expected JSON but got ${contentType} for ${method} ${path}. Response starts with: ${preview}`
      );
    }
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText} for ${method} ${path}: ${text}`);
  }

  return parsed;
}

async function authenticate({ baseUrl, slug, clientId, clientSecret }) {
  const body = {
    client_id: clientId,
    client_secret: clientSecret,
  };

  const response = await requestJson({
    baseUrl,
    path: `/s/${slug}/auth/api-token`,
    method: 'POST',
    body,
  });

  if (!response || typeof response.token !== 'string' || !response.token.trim()) {
    throw new Error('Authentication succeeded but no token was returned.');
  }

  return response.token;
}

async function getAllProjects({ baseUrl, slug, token }) {
  const projects = [];
  let page = 1;

  while (true) {
    const response = await requestJson({
      baseUrl,
      token,
      path: `/api/madoc/projects?page=${page}&published=false`,
    });

    const pageProjects = Array.isArray(response?.projects) ? response.projects : [];
    projects.push(...pageProjects);

    const totalPages = Number(response?.pagination?.totalPages || 1);
    if (page >= totalPages) {
      break;
    }

    page += 1;
  }

  return projects;
}

async function getAllDerivedModelIds({ baseUrl, slug, token, rootModelId }) {
  const response = await requestJson({
    baseUrl,
    token,
    path: `/api/madoc/crowdsourcing/model?derived_from=${encodeURIComponent(
      rootModelId
    )}&all_derivatives=true&_all=true`,
  });

  if (!Array.isArray(response)) {
    return [];
  }

  return response.map(model => model?.id).filter(id => typeof id === 'string' && id);
}

async function getCaptureModel({ baseUrl, slug, token, modelId }) {
  return requestJson({
    baseUrl,
    token,
    path: `/api/madoc/crowdsourcing/model/${modelId}`,
  });
}

async function updateCaptureModel({ baseUrl, slug, token, modelId, captureModel }) {
  return requestJson({
    baseUrl,
    token,
    path: `/api/madoc/crowdsourcing/model/${modelId}`,
    method: 'PUT',
    body: captureModel,
  });
}

function toProjectIdSet(projectIds) {
  if (!projectIds.length) {
    return null;
  }

  return new Set(projectIds.map(value => String(value)));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const hasToken = typeof options.token === 'string' && options.token.trim().length > 0;
  const hasApiKeyPair =
    typeof options.clientId === 'string' &&
    options.clientId.trim().length > 0 &&
    typeof options.clientSecret === 'string' &&
    options.clientSecret.trim().length > 0;

  if (!options.baseUrl || !options.slug || (!hasToken && !hasApiKeyPair)) {
    printHelp();
    throw new Error(
      'Missing required inputs: base-url, slug, and either --token (or MADOC_TOKEN) or client-id/client-secret.'
    );
  }

  const baseUrl = options.baseUrl.replace(/\/$/, '');

  let token = hasToken ? options.token.trim() : '';
  if (hasToken) {
    console.log('Using provided token...');
  } else {
    console.log('Authenticating API key...');
    token = await authenticate({
      baseUrl,
      slug: options.slug,
      clientId: options.clientId,
      clientSecret: options.clientSecret,
    });
  }

  const payload = decodeJwtPayload(token);
  const scope = normalizeScope(payload?.scope);
  const tokenSiteId = payload?.site?.id;
  console.log(`Token scope: ${scope.length ? scope.join(' ') : '(none)'}`);

  if (options.siteId && tokenSiteId && String(options.siteId) !== String(tokenSiteId)) {
    throw new Error(
      `Site mismatch: token belongs to site ${tokenSiteId} but --site-id was ${options.siteId}.`
    );
  }

  if (!scope.includes('models.create')) {
    console.warn('Warning: token does not include "models.create"; update requests may fail.');
  }

  console.log('Loading projects...');
  const projects = await getAllProjects({ baseUrl, slug: options.slug, token });
  console.log(`Loaded ${projects.length} visible project(s) from /api/projects`);
  const selectedProjectIds = toProjectIdSet(options.projectIds);

  const candidateProjects = projects.filter(project => {
    if (selectedProjectIds && !selectedProjectIds.has(String(project.id))) {
      return false;
    }

    if (options.includeNonTabular) {
      return true;
    }

    return project.template === 'tabular-project';
  });

  if (!candidateProjects.length) {
    if (selectedProjectIds) {
      const selectedVisibleProjects = projects.filter(project => selectedProjectIds.has(String(project.id)));

      if (!selectedVisibleProjects.length) {
        console.log(
          `No selected project IDs were visible to this token (${Array.from(selectedProjectIds).join(', ')}).`
        );
        console.log(
          'This usually means the token lacks site admin scope, or those projects are unpublished/inaccessible.'
        );
      } else if (!options.includeNonTabular) {
        const templateMap = selectedVisibleProjects
          .map(project => `${project.id}:${project.template || 'unknown'}`)
          .join(', ');
        console.log(`Selected projects are visible, but filtered out by template: ${templateMap}`);
      }
    }

    console.log('No matching projects found.');
    return;
  }

  const projectModelMap = new Map();

  for (const project of candidateProjects) {
    const rootModelId = project.capture_model_id;
    if (!rootModelId) {
      continue;
    }

    const modelIds = unique([rootModelId, ...(await getAllDerivedModelIds({
      baseUrl,
      slug: options.slug,
      token,
      rootModelId,
    }))]);

    for (const modelId of modelIds) {
      if (!projectModelMap.has(modelId)) {
        projectModelMap.set(modelId, {
          modelId,
          rootModelId,
          projectIds: new Set([project.id]),
        });
      } else {
        projectModelMap.get(modelId).projectIds.add(project.id);
      }
    }
  }

  const entries = Array.from(projectModelMap.values());

  console.log(
    `${options.apply ? 'Applying' : 'Dry run'} migration over ${entries.length} unique capture models from ${candidateProjects.length} project(s)...`
  );

  let migratedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const entry of entries) {
    try {
      const model = await getCaptureModel({
        baseUrl,
        slug: options.slug,
        token,
        modelId: entry.modelId,
      });

      const migrationResult = migrateCaptureModelToRowShape(model);

      if (!migrationResult.changed) {
        skippedCount += 1;
        console.log(`SKIP ${entry.modelId} (${migrationResult.reason})`);
        continue;
      }

      if (options.apply) {
        await updateCaptureModel({
          baseUrl,
          slug: options.slug,
          token,
          modelId: entry.modelId,
          captureModel: migrationResult.captureModel,
        });
      }

      migratedCount += 1;
      console.log(
        `${options.apply ? 'UPDATED' : 'WOULD UPDATE'} ${entry.modelId} (columns: ${migrationResult.rowColumns.join(', ')})`
      );
    } catch (error) {
      failedCount += 1;
      console.error(`FAIL ${entry.modelId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log('');
  console.log(`Projects considered: ${candidateProjects.length}`);
  console.log(`Models scanned: ${entries.length}`);
  console.log(`${options.apply ? 'Models updated' : 'Models that would be updated'}: ${migratedCount}`);
  console.log(`Models skipped: ${skippedCount}`);
  console.log(`Models failed: ${failedCount}`);

  if (failedCount > 0) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
