import { generateId } from '@capture-models/helpers';
import { sql } from 'slonik';
import { getProject } from '../../database/queries/project-queries';
import { PersonalNotesRow } from '../../types/personal-notes';
import { RouteMiddleware } from '../../types/route-middleware';
import { RequestError } from '../../utility/errors/request-error';
import { parseProjectId } from '../../utility/parse-project-id';
import { userWithScope } from '../../utility/user-with-scope';

export const updateProjectNote: RouteMiddleware<
  { id: string; resourceId: string },
  { note: string }
> = async context => {
  const { siteId, id: userId } = userWithScope(context, []);
  const parsedId = context.params.id ? parseProjectId(context.params.id) : null;
  const project = parsedId ? await context.connection.one(getProject(parsedId, siteId)) : null;
  const projectId = project ? project.id : null;
  const resourceId = Number(context.params.resourceId);

  if (!resourceId || !projectId || Number.isNaN(resourceId)) {
    throw new RequestError();
  }

  const { note } = context.requestBody;

  if (!resourceId || !projectId) {
    throw new RequestError();
  }

  // @todo check if exists in derived site / project.

  // Does note already exist?
  const existingNote = await context.connection.maybeOne(
    sql<
      PersonalNotesRow
    >`select * from project_notes where type=${'personal'} and site_id = ${siteId} and resource_id = ${resourceId} and user_id = ${userId} and project_id = ${projectId}`
  );

  if (existingNote) {
    // Update existing.
    await context.connection.query(sql`update project_notes set note = ${note} where id = ${existingNote.id}`);

    context.status = 200;
  } else {
    // Create new.
    await context.connection.query(
      sql`insert into project_notes (type, note, project_id, user_id, resource_id, site_id, id) 
      values (
        ${'personal'},
        ${note},
        ${projectId},
        ${userId},
        ${resourceId},
        ${siteId},
        ${generateId()}
      )`
    );

    context.status = 201;
  }
};
