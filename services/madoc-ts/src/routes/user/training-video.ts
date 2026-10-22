import { TrainingVideoWatchedRequest, TrainingVideoWatchedResponse } from '../../types/schemas/training-video';
import { RouteMiddleware } from '../../types/route-middleware';
import { RequestError } from '../../utility/errors/request-error';
import { getWatchedTrainingVideos } from '../../utility/training-video-preferences';
import { onlyPublishedProjects, userWithScope } from '../../utility/user-with-scope';

export const getTrainingVideoWatched: RouteMiddleware = async context => {
  const { id, siteId } = userWithScope(context, ['site.view']);
  const { preferences } = await context.siteManager.getProtectedUserDetails(id);

  const body: TrainingVideoWatchedResponse = { watched: getWatchedTrainingVideos(preferences, siteId) };
  context.response.body = body;
};

export const markTrainingVideoWatchedRoute: RouteMiddleware<
  Record<string, string>,
  TrainingVideoWatchedRequest
> = async context => {
  const { id, siteId, scope } = userWithScope(context, ['site.view']);
  const projectId = context.requestBody?.projectId;

  if (typeof projectId !== 'number' || !Number.isSafeInteger(projectId) || projectId <= 0) {
    throw new RequestError('Invalid project id');
  }

  // Reject missing, unpublished and other-site projects using the existing project visibility rules.
  await context.projects.getProjectByIdOrSlug(projectId, siteId, onlyPublishedProjects(scope));
  const watched = await context.siteManager.markTrainingVideoWatched(id, siteId, projectId);
  const body: TrainingVideoWatchedResponse = { watched };
  context.response.body = body;
};
