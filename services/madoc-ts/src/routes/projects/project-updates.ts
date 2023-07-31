import invariant from 'tiny-invariant';
import { CreateProjectUpdate } from '../../types/projects';
import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { NotFound } from '../../utility/errors/not-found';
import { optionalUserWithScope, userWithScope } from '../../utility/user-with-scope';

export const listProjectUpdates: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.admin']);

  const project = await context.projects.resolveProject(context.params.id, siteId);
  if (!project) {
    throw new NotFound();
  }

  const page = Number(context.query.page || 1);
  const onlyOne = castBool(context.query.latest);
  const perPage = onlyOne ? 1 : Number(context.query.per_page || 10);

  const updates = await context.projects.listProjectUpdates(project.id, siteId, perPage, page * perPage);
  const total = await context.projects.countProjectUpdates(project.id, siteId);
  const totalPages = Math.ceil(total / perPage);

  context.response.body = {
    updates: updates,
    pagination: {
      page,
      totalPages,
      totalResults: total,
    },
  };
};

export const createProjectUpdate: RouteMiddleware<{ id: string | number }, { update: string }> = async context => {
  const { siteId, id } = userWithScope(context, ['site.admin']);

  const project = await context.projects.resolveProject(context.params.id, siteId);
  if (!project) {
    throw new NotFound();
  }

  const update = context.requestBody as CreateProjectUpdate;

  invariant(update.update, 'Update must have a value');

  // @todo snapshot.
  update.snapshot = {};

  context.response.body = await context.projects.createProjectUpdate(update, id, project.id);
};

export const updateProjectUpdate: RouteMiddleware<
  { id: string | number; updateId: string | number },
  { update: string }
> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const project = await context.projects.resolveProject(context.params.id, siteId);
  if (!project) {
    throw new NotFound();
  }

  const body = context.requestBody;

  invariant(body.update, 'Update must have a value');

  context.response.body = await context.projects.updateProjectUpdate(
    body.update,
    Number(context.params.updateId),
    project.id
  );
};

export const deleteProjectUpdate: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const project = await context.projects.resolveProject(context.params.id, siteId);
  if (!project) {
    throw new NotFound();
  }

  await context.projects.deleteProjectUpdate(Number(context.params.updateId), project.id);

  context.response.status = 200;
};
