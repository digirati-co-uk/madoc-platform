import { RevisionRequest } from '../../frontend/shared/capture-models/types/revision-request';
import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { RequestError } from '../../utility/errors/request-error';
import { userWithScope } from '../../utility/user-with-scope';
import { userCan } from '../../utility/user-can';

export const createRevisionApi: RouteMiddleware<{ captureModelId: string }, RevisionRequest> = async context => {
  const { siteId, id } = userWithScope(context, ['models.contribute']);

  const revisionRequest = context.requestBody;
  const captureModelId = context.params.captureModelId;
  const showRevised = castBool(context.query.show_revised as string);

  if (revisionRequest.captureModelId !== captureModelId) {
    throw new RequestError('Invalid capture model request');
  }

  // if (await context.db.api.revisionExists(revisionRequest.revision.id)) {
  //   throw new RequestError('Revision already exists');
  // }

  // Different types of revisions. @todo what to do in these cases.
  if (revisionRequest.revision.approved && !userCan('models.create', context.state)) {
    throw new Error('Auto approved');
  }
  if (revisionRequest.revision.source === 'canonical' && !userCan('models.create', context.state)) {
    throw new Error('Editing canonical');
  }

  context.response.body = await context.captureModels.createRevision(revisionRequest, {
    allowAnonymous: true,
    siteId,
    allowCanonicalChanges: userCan('models.create', context.state),
    userId: id,
    showRevised,
  });
};
