import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { userCan } from '../../utility/user-can';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const revisionTemplate: RouteMiddleware = async context => {
  const { id, siteId } = optionalUserWithScope(context, ['models.contribute']);
  const canSeeFullModel = userCan('models.create', context.state);

  const query = context.query as {
    include_revisions?: string;
    include_structures?: string;
    userOnly?: string;
  };

  const includeRevisions = castBool(query.include_revisions, true);
  const includeStructures = castBool(query.include_structures, true);
  const userOnly = castBool(query.userOnly, true);

  const captureModelId = context.params.captureModelId;
  const revisionId = context.params.revisionId;

  context.response.body = await context.captureModels.getRevisionTemplate(captureModelId, revisionId, siteId, {
    userId: canSeeFullModel && !userOnly ? undefined : id,
    includeRevisions,
    includeStructures,
  });
};
