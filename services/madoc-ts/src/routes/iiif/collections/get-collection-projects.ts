import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';
import { mapMetadata } from '../../../utility/iiif-metadata';
import { getProjectsByResource } from '../../../database/queries/get-projects-by-resource';

export const getCollectionProjects: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, []);
  const collectionId = Number(context.params.id);

  const foundProjects = await context.connection.any(getProjectsByResource('collection', collectionId, siteId));

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
