// Updates metadata on underlying collection inside the project.
import { RouteMiddleware } from '../../types/route-middleware';
import { sql } from 'slonik';
import { parseProjectId } from '../../utility/parse-project-id';
import { userWithScope } from '../../utility/user-with-scope';
import {
  addDerivedMetadata,
  deleteDerivedMetadata,
  updateDerivedMetadata,
} from '../../database/queries/metadata-queries';
import { MetadataUpdate } from '../../types/schemas/metadata-update';
import { api } from '../../gateway/api.server';
import { getProject } from '../../database/queries/project-queries';

type UpdateProject = {
  metadata: MetadataUpdate;
};

export const updateProjectMetadata: RouteMiddleware<{ id: string }, UpdateProject> = async context => {
  // Also update the task label and summary?
  const { siteId } = userWithScope(context, ['site.admin']);
  const { projectId, projectSlug } = parseProjectId(context.params.id);
  const { metadata } = context.requestBody;

  const userApi = api.asUser({ siteId });

  // 1. get project.
  const project = await context.connection.one(getProject({ projectId, projectSlug }, siteId));

  // 2. Update collection.
  const { added, modified, removed } = metadata;
  await context.connection.transaction(async connection => {
    const addedQuery = addDerivedMetadata(added, project.collection_id, siteId);
    const updatedQuery = updateDerivedMetadata(modified, project.collection_id, siteId);
    const removedQuery = deleteDerivedMetadata(removed, project.collection_id, siteId);

    if (addedQuery) {
      await connection.query(addedQuery);
    }
    if (updatedQuery) {
      await connection.query(updatedQuery);
    }
    if (removedQuery) {
      await connection.query(removedQuery);
    }
  });

  // 3. Update task.
  // 3.1 - get first label and first summary in the derived metadata for the collection
  // todo maybe the user want's a preference for the default label?
  const getSingleField = (key: string) => sql`
      select value
      from iiif_metadata
      where resource_id = ${project.collection_id}
        and key = ${key}
        and site_id = ${siteId}
      limit 1
  `;

  // 3.2 - get 2 string values
  const { label, summary } = await context.connection.one<{ label: string; summary: string }>(
    sql`select 
      (${getSingleField('label')}) as label,
      (${getSingleField('summary')}) as summary
    `
  );

  // 3.3 - update the task.
  await userApi.updateTask(project.task_id, {
    name: label,
    description: summary,
  });

  context.response.body = {
    label,
    summary,
  };
};
