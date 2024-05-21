import invariant from 'tiny-invariant';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { userWithScope } from '../../utility/user-with-scope';

export const listProjectFeedback: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const project = await context.projects.resolveProject(context.params.id, siteId);
  if (!project) {
    throw new NotFound();
  }

  context.response.body = {
    feedback: await context.projects.listProjectFeedback(project.id, siteId),
  };
};

export const addProjectFeedback: RouteMiddleware<{ id: string | number }, { feedback: string }> = async context => {
  const { siteId, id, scope } = userWithScope(context, ['site.view']);

  const isAdmin = scope.indexOf('site.admin') !== -1;

  const project = await context.projects.resolveProject(context.params.id, siteId);
  if (!project) {
    throw new NotFound();
  }

  // Only user members can add feedback.
  // @todo this check does not seem to be working
  // if (!isAdmin && (await context.projects.isUserProjectMember(id, project.id))) {
  //   throw new NotFound();
  // }

  const feedback = context.requestBody.feedback;

  context.response.body = await context.projects.createProjectFeedback(feedback, id, project.id);
};

export const removeProjectFeedback: RouteMiddleware<{
  id: string | number;
  feedbackId: string | number;
}> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const project = await context.projects.resolveProject(context.params.id, siteId);
  if (!project) {
    throw new NotFound();
  }

  const feedbackId = Number(context.params.feedbackId);

  invariant(feedbackId, 'Feedback ID must be provided');
  invariant(!Number.isNaN(feedbackId), 'Feedback ID must be a number');

  context.response.body = await context.projects.deleteProjectFeedback(feedbackId, project.id);
};
