import { getProject } from '../../database/queries/project-queries';
import { RouteMiddleware } from '../../types/route-middleware';
import { parseProjectId } from '../../utility/parse-project-id';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const resolveSlots: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.read']);

  const query = context.query;

  const slotCtx: {
    collection?: number;
    manifest?: number;
    canvas?: number;
    project?: number;
  } = {
    collection: query.collection ? Number(query.collection) : undefined,
    manifest: query.manifest ? Number(query.manifest) : undefined,
    canvas: query.canvas ? Number(query.canvas) : undefined,
  };

  const parsedId = context.query.project ? parseProjectId(context.query.project) : undefined;
  const project = parsedId ? await context.connection.one(getProject(parsedId, siteId)) : undefined;
  if (project) {
    slotCtx.project = project.id;
  }

  context.response.body = await context.pageBlocks.getSlotsByContext(slotCtx, siteId);
  context.response.status = 200;
};
