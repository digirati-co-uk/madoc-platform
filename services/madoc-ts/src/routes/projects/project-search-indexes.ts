import { createHash } from 'crypto';
import { v4 } from 'uuid';
import { getProject } from '../../database/queries/project-queries';
import {
  getProjectCaptureModelsForSearchExport,
  getProjectSearchIIIFResources,
} from '../../database/queries/search-index-export';
import { getProjectSearchIndexEntityOptions } from '../../frontend/shared/capture-models/helpers/project-search-index-options';
import { api } from '../../gateway/api.server';
import { createTask as createSearchIndexTask } from '../../gateway/tasks/search-index-task';
import {
  getProjectSearchIndexConfiguration,
  saveProjectSearchIndexConfiguration,
} from '../../search/project-search-index-configuration';
import { buildProjectSearchDocuments } from '../../search/typesense/build-project-search-documents';
import {
  getTypesenseProjectSearchCollectionName,
  isTypesenseConfigured,
  TypesenseClient,
} from '../../search/typesense/typesense-client';
import {
  ProjectSearchIndexDefinition,
  ProjectSearchIndexRequest,
  PublicProjectSearchIndex,
} from '../../types/schemas/project-search-index';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { parseProjectId } from '../../utility/parse-project-id';
import { parseUrn } from '../../utility/parse-urn';
import { RequestError } from '../../utility/errors/request-error';
import { onlyPublishedProjects, optionalUserWithScope, userWithScope } from '../../utility/user-with-scope';

async function getScopedProject(context: Parameters<RouteMiddleware>[0], idOrSlug: string, siteId: number) {
  const parsed = parseProjectId(idOrSlug);
  const project = await context.connection.maybeOne(getProject(parsed, siteId));
  if (!project) throw new NotFound('Project not found');
  return project;
}

async function getUserApi(context: Parameters<RouteMiddleware>[0], siteId: number, userId?: number) {
  const site = await context.siteManager.getSiteById(siteId);
  const userApi = api.asUser({ siteId, userId }, { siteSlug: site.slug });
  context.disposableApis.push(userApi);
  return userApi;
}

function samePath(left: string[] | undefined, right: string[] | undefined) {
  return JSON.stringify(left || []) === JSON.stringify(right || []);
}

async function validateRequest(
  context: Parameters<RouteMiddleware>[0],
  siteId: number,
  captureModelId: string,
  request: ProjectSearchIndexRequest
) {
  if (!request.label?.trim()) throw new RequestError('Search index label is required');
  const model = await context.captureModels.getCaptureModel(captureModelId, { revisionStatus: 'accepted' }, siteId);
  const entity = getProjectSearchIndexEntityOptions(model.document).find(option => samePath(option.path, request.entityPath));
  if (!entity) throw new RequestError('Invalid capture model entity path');
  if (request.uniqueField && !entity.fields.some(field => samePath(field.path, request.uniqueField))) {
    throw new RequestError('Invalid unique field');
  }
  for (const facet of request.facets || []) {
    if (!entity.fields.some(field => samePath(field.path, facet.path))) {
      throw new RequestError(`Invalid facet field ${facet.path.join('.')}`);
    }
  }
}

function createDefinition(request: ProjectSearchIndexRequest, id = v4()): ProjectSearchIndexDefinition {
  return {
    id,
    presetKey: request.presetKey,
    label: request.label.trim(),
    summary: request.summary?.trim() || undefined,
    entityPath: request.entityPath,
    uniqueField: request.uniqueField?.length ? request.uniqueField : undefined,
    facets: request.facets || [],
    includeUnapproved: !!request.includeUnapproved,
    enabled: request.enabled !== false,
  };
}

function hasSameIndexedSettings(left: ProjectSearchIndexDefinition, right: ProjectSearchIndexDefinition) {
  return (
    left.label === right.label &&
    samePath(left.entityPath, right.entityPath) &&
    samePath(left.uniqueField, right.uniqueField) &&
    JSON.stringify(left.facets) === JSON.stringify(right.facets) &&
    left.includeUnapproved === right.includeUnapproved
  );
}

export const listProjectSearchIndexes: RouteMiddleware<{ id: string }> = async context => {
  const { id: userId, siteId } = userWithScope(context, ['site.admin']);
  const project = await getScopedProject(context, context.params.id, siteId);
  const userApi = await getUserApi(context, siteId, userId);
  context.response.body = (await getProjectSearchIndexConfiguration(userApi, siteId, project.id)).config;
};

export const createProjectSearchIndex: RouteMiddleware<{ id: string }, ProjectSearchIndexRequest> = async context => {
  const { id: userId, siteId } = userWithScope(context, ['site.admin']);
  const project = await getScopedProject(context, context.params.id, siteId);
  await validateRequest(context, siteId, project.capture_model_id, context.requestBody);
  const userApi = await getUserApi(context, siteId, userId);
  const { config } = await getProjectSearchIndexConfiguration(userApi, siteId, project.id);
  const definition = createDefinition(context.requestBody);
  await saveProjectSearchIndexConfiguration(userApi, siteId, project.id, {
    ...config,
    indexes: [...config.indexes, definition],
  });
  context.response.status = 201;
  context.response.body = definition;
};

export const updateProjectSearchIndex: RouteMiddleware<
  { id: string; indexId: string },
  ProjectSearchIndexRequest
> = async context => {
  const { id: userId, siteId } = userWithScope(context, ['site.admin']);
  const project = await getScopedProject(context, context.params.id, siteId);
  await validateRequest(context, siteId, project.capture_model_id, context.requestBody);
  const userApi = await getUserApi(context, siteId, userId);
  const { config } = await getProjectSearchIndexConfiguration(userApi, siteId, project.id);
  const existing = config.indexes.find(index => index.id === context.params.indexId);
  if (!existing) throw new NotFound('Search index not found');
  const next = createDefinition(context.requestBody, context.params.indexId);
  const definition: ProjectSearchIndexDefinition = hasSameIndexedSettings(existing, next)
    ? {
        ...next,
        lastIndexedAt: existing.lastIndexedAt,
        lastIndexedHash: existing.lastIndexedHash,
        documentCount: existing.documentCount,
        warnings: existing.warnings,
      }
    : next;
  await saveProjectSearchIndexConfiguration(userApi, siteId, project.id, {
    ...config,
    indexes: config.indexes.map(index => (index.id === definition.id ? definition : index)),
  });
  context.response.body = definition;
};

export const deleteProjectSearchIndex: RouteMiddleware<{ id: string; indexId: string }> = async context => {
  const { id: userId, siteId } = userWithScope(context, ['site.admin']);
  const project = await getScopedProject(context, context.params.id, siteId);
  const userApi = await getUserApi(context, siteId, userId);
  const { config } = await getProjectSearchIndexConfiguration(userApi, siteId, project.id);
  if (!config.indexes.some(index => index.id === context.params.indexId)) throw new NotFound('Search index not found');
  if (isTypesenseConfigured()) {
    try {
      await new TypesenseClient().deleteCollection(
        getTypesenseProjectSearchCollectionName(siteId, project.id, context.params.indexId),
        { allow404: true }
      );
    } catch {
      // The collection is derived data; an unavailable search service must not block deleting its definition.
    }
  }
  await saveProjectSearchIndexConfiguration(userApi, siteId, project.id, {
    ...config,
    indexes: config.indexes.filter(index => index.id !== context.params.indexId),
  });
  context.response.status = 204;
};

export const reindexProjectSearchIndex: RouteMiddleware<{ id: string; indexId: string }> = async context => {
  const { id: userId, siteId } = userWithScope(context, ['site.admin']);
  const project = await getScopedProject(context, context.params.id, siteId);
  const userApi = await getUserApi(context, siteId, userId);
  const { config } = await getProjectSearchIndexConfiguration(userApi, siteId, project.id);
  if (!config.indexes.some(index => index.id === context.params.indexId)) throw new NotFound('Search index not found');
  context.response.body = await userApi.newTask(
    createSearchIndexTask([{ id: project.id, type: 'project-entity-index', indexId: context.params.indexId }], siteId)
  );
};

export const indexProjectSearchIndex: RouteMiddleware<{ id: string; indexId: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, []);
  const project = await getScopedProject(context, context.params.id, siteId);
  const userApi = await getUserApi(context, siteId);
  const { config } = await getProjectSearchIndexConfiguration(userApi, siteId, project.id);
  const definition = config.indexes.find(index => index.id === context.params.indexId);
  if (!definition) throw new NotFound('Search index not found');

  const models = await context.connection.any(getProjectCaptureModelsForSearchExport(project.id, siteId));
  const resourceIds = [
    ...new Set(
      models.flatMap(model => model.target.map(target => parseUrn(target.id)?.id).filter((id): id is number => !!id))
    ),
  ];
  const iiifResources = await context.connection.any(getProjectSearchIIIFResources(resourceIds, siteId));
  const result = await buildProjectSearchDocuments({ definition, projectId: project.id, models, iiifResources });
  const collection = getTypesenseProjectSearchCollectionName(siteId, project.id, definition.id);
  const typesense = new TypesenseClient();
  await typesense.deleteCollection(collection, { allow404: true });
  await typesense.ensureProjectSearchCollection(collection);
  if (result.documents.length) {
    await typesense.upsertDocumentsStream(collection, result.documents);
  }

  const latest = await getProjectSearchIndexConfiguration(userApi, siteId, project.id);
  const hash = createHash('sha256')
    .update(
      JSON.stringify({
        id: definition.id,
        label: definition.label,
        entityPath: definition.entityPath,
        uniqueField: definition.uniqueField,
        facets: definition.facets,
        includeUnapproved: definition.includeUnapproved,
      })
    )
    .digest('hex');
  await saveProjectSearchIndexConfiguration(userApi, siteId, project.id, {
    ...latest.config,
    indexes: latest.config.indexes.map(index =>
      index.id === definition.id
        ? {
            ...index,
            lastIndexedAt: new Date().toISOString(),
            lastIndexedHash: hash,
            documentCount: result.documents.length,
            warnings: result.warnings,
          }
        : index
    ),
  });
  context.response.body = { collection, indexed: result.documents.length, warnings: result.warnings };
};

export const listPublicProjectSearchIndexes: RouteMiddleware<{ slug: string; project: string }> = async context => {
  const site = await context.siteManager.getSiteBySlug(context.params.slug);
  if (!site) throw new NotFound('Site not found');
  const siteId = site.id;
  const project = await context.projects.getProjectByIdOrSlug(
    context.params.project,
    siteId,
    onlyPublishedProjects(context.state.jwt?.scope)
  );
  const userApi = await getUserApi(context, siteId);
  const { config } = await getProjectSearchIndexConfiguration(userApi, siteId, project.id);
  context.response.body = config.indexes
    .filter(index => index.enabled && index.lastIndexedAt)
    .map(
      (index): PublicProjectSearchIndex => ({
        id: index.id,
        label: index.label,
        summary: index.summary,
        facets: index.facets,
        collection: getTypesenseProjectSearchCollectionName(siteId, project.id, index.id),
      })
    );
};
