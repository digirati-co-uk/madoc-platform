import { buildProjectTypesenseDocument } from '../../search/typesense/build-manifest-documents';
import {
  isTypesenseAvailable,
  isTypesenseSearchEnabled,
  resolveTypesenseSearchCollection,
  TypesenseClient,
} from '../../search/typesense/typesense-client';
import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}

export const indexProject: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, siteUrn } = optionalUserWithScope(context, []);
  const siteIdAsNumber = Number(siteId);
  const projectId = Number(context.params.id);
  const projectUrn = `urn:madoc:project:${projectId}`;
  const site = await context.siteManager.getSiteById(siteId);
  const forceIndex = context.query.force === 'true';

  if (site.config.disableSearchIndexing && !forceIndex) {
    context.response.body = { noSearch: true };
    return;
  }

  const project = await context.projects.getProjectByIdOrSlug(projectId, siteIdAsNumber);
  const availability = await isTypesenseAvailable();
  const collectionName = resolveTypesenseSearchCollection({ siteId: siteIdAsNumber });

  if (!project || (project.status !== 1 && project.status !== 2)) {
    if (availability.available) {
      const typesense = new TypesenseClient();
      await typesense.deleteDocument(collectionName, `${projectUrn}:site:${siteIdAsNumber}`, { allow404: true });
    }
    context.response.body = {
      noSearch: true,
      reason: project ? 'Project is not published' : 'Project does not exist',
    };
    return;
  }

  if (!availability.available) {
    context.response.body = {
      project: { id: projectId },
      typesense: null,
      warnings: isTypesenseSearchEnabled() ? [availability.reason || 'Typesense is unavailable'] : [],
    };
    return;
  }

  try {
    const typesense = new TypesenseClient();
    await typesense.ensureSearchCollection(collectionName);
    const importResult = await typesense.upsertDocumentsStream(collectionName, [
      buildProjectTypesenseDocument(project, { siteId: siteIdAsNumber, siteUrn }),
    ]);

    context.response.body = {
      project: { id: projectId },
      typesense: { indexed: importResult.total, collection: collectionName, importResult },
      warnings: [],
    };
  } catch (error) {
    context.response.body = {
      project: { id: projectId },
      typesense: null,
      warnings: [`Typesense indexing failed: ${getErrorMessage(error)}`],
    };
  }
};
