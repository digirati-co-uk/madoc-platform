import { sql } from 'slonik';
import { getProject } from '../../database/queries/project-queries';
import { PersonalNotesRow } from '../../types/personal-notes';
import { RouteMiddleware } from '../../types/route-middleware';
import { RequestError } from '../../utility/errors/request-error';
import { parseProjectId } from '../../utility/parse-project-id';
import { userWithScope } from '../../utility/user-with-scope';

export const getProjectNote: RouteMiddleware<{ id: string; resourceId: string }> = async context => {
  const { siteId, id: userId } = userWithScope(context, []);
  const parsedId = context.params.id ? parseProjectId(context.params.id) : null;
  const project = parsedId ? await context.connection.one(getProject(parsedId, siteId)) : null;
  const projectId = project ? project.id : null;

  const resourceId = Number(context.params.resourceId);

  if (!resourceId || !projectId || Number.isNaN(resourceId)) {
    throw new RequestError();
  }

  // Does note already exist?
  const existingNote = await context.connection.maybeOne(
    sql<
      PersonalNotesRow
    >`select * from project_notes where type=${'personal'} and site_id = ${siteId} and resource_id = ${resourceId} and user_id = ${userId} and project_id = ${projectId}`
  );

  if (existingNote) {
    context.response.status = 200;
    context.response.body = {
      note: existingNote.note,
    };
  } else {
    context.response.status = 200;
    context.response.body = {
      note: '',
    };
  }
};
