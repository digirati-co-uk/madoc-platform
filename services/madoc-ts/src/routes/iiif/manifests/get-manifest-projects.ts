import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';
import { mapMetadata } from '../../../utility/iiif-metadata';
import { getProjectsByResource } from '../../../database/queries/get-projects-by-resource';

export const getManifestProjects: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, []);
  const manifestId = Number(context.params.id);

  const foundProjects = await context.connection.any(getProjectsByResource('manifest', manifestId, siteId));

  context.response.body = {
    projects: foundProjects.length
      ? mapMetadata(foundProjects, row => {
          return {
            id: row.project_id,
            type: 'project',
          };
        })
      : [],
  };
};
