import { RouteMiddleware } from '../../types/route-middleware';
import { userCan } from '../../utility/user-can';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const forkRevisionApi: RouteMiddleware<{ captureModelId: string; revisionId: string }> = async context => {
  const { id, siteId } = optionalUserWithScope(context, ['models.contribute']);

  const query = context.query as {
    clone_mode: string;
  };

  const cloneMode = userCan('models.create', context.state) ? query.clone_mode || 'FORK_TEMPLATE' : 'FORK_TEMPLATE';

  // @todo, params for cloneMode, modelMapping and other options.
  context.response.body = await context.captureModels.forkRevision(
    context.params.captureModelId,
    context.params.revisionId,
    siteId,
    {
      modelRoot: [],
      cloneMode,
      includeRevisions: true,
      includeStructures: true,
      userId: id,
    }
  );
};
