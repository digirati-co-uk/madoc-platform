import { TrainingVideoWatchedRequest, TrainingVideoWatchedResponse } from '../../types/schemas/training-video';
import { RouteMiddleware } from '../../types/route-middleware';
import { RequestError } from '../../utility/errors/request-error';
import { getWatchedTrainingVideos, markTrainingVideoWatched } from '../../utility/training-video-preferences';
import { userWithScope } from '../../utility/user-with-scope';

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
  const { id, siteId } = userWithScope(context, ['site.view']);
  const projectId = Number(context.requestBody?.projectId);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw new RequestError('Invalid project id');
  }

  const { preferences } = await context.siteManager.getProtectedUserDetails(id);
  await context.siteManager.updateUserPreferences(
    id,
    markTrainingVideoWatched(preferences, siteId, projectId, new Date().toISOString())
  );

  const updated = await context.siteManager.getProtectedUserDetails(id);
  const body: TrainingVideoWatchedResponse = { watched: getWatchedTrainingVideos(updated.preferences, siteId) };
  context.response.body = body;
};
