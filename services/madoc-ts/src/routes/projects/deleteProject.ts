import { api } from '../../gateway/api.server';
import { userWithScope } from '../../utility/user-with-scope';
import { RouteMiddleware } from '../../types/route-middleware';
import {
  deleteProjectMetadata,
  deleteProjectNotes,
  deleteProjectRecord,
  getProjectAssociates,
} from '../../database/queries/deletion-queries';
import { DatabasePoolConnectionType } from 'slonik';
import { deleteCollection } from '../iiif/collections/delete-collection';
import { buildProjectDeletionSummary } from './delete-project-summary';

export const deleteProjectEndpoint: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const projectId = context.params.id;

  await deleteProject(projectId, siteId, () => context.connection);

  context.response.status = 204;
};

export async function deleteProject(projectId: number, siteId: number, connection: () => DatabasePoolConnectionType) {
  const siteApi = api.asUser({ siteId });

  const deletionSummary = await buildProjectDeletionSummary(projectId, siteId, connection);
  const { collection_id, capture_model_id } = await connection().one(getProjectAssociates(projectId));

  if (deletionSummary.tasks > 0 || deletionSummary.parentTasks > 0) {
    await siteApi.batchDeleteTasks({ resourceId: collection_id, subject: `urn:madoc:collection:${collection_id}` });
  }

  if (deletionSummary.search.indexed && deletionSummary.search.id) {
    await siteApi.searchDeleteIIIF(deletionSummary.search.id);
  }

  // Delete capture model
  await siteApi.deleteCaptureModel(capture_model_id);

  // Delete metadata
  await connection().any(deleteProjectMetadata(projectId));

  // Delete project
  await connection().any(deleteProjectNotes(projectId));
  await connection().any(deleteProjectRecord(projectId));

  // Delete project collection
  await deleteCollection(collection_id, siteId, connection, false);
}
