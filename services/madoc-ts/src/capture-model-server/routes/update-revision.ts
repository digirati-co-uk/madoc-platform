import { RevisionRequest } from '../../frontend/shared/capture-models/types/revision-request';
import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { RequestError } from '../../utility/errors/request-error';
import { userCan } from '../../utility/user-can';
import { userWithScope } from '../../utility/user-with-scope';

export const updateRevisionApi: RouteMiddleware<{ id: string }, RevisionRequest> = async (context, next) => {
  const { id, userUrn, siteId } = userWithScope(context, ['models.contribute']);
  const canCreate = userCan('models.create', context.state);

  console.log({ canCreate, userUrn });

  const revisionRequest = context.requestBody;
  if (context.params.id !== revisionRequest.revision.id) {
    throw new RequestError('Revision cannot be saved to another revision');
  }

  const showRevised = castBool(context.query.show_revised as string);

  if (!revisionRequest.author) {
    revisionRequest.author = { id: userUrn, type: 'Person' };
  }

  context.response.body = await context.captureModels.updateRevision(revisionRequest, {
    siteId,
    userId: id,
    checkUserIdMatches: !canCreate,
    allowReview: canCreate,
    allowCanonicalChanges: canCreate,
    showRevised,
  });
  context.status = 200;
};
