import { getProject } from '../../database/queries/project-queries';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { parseProjectId } from '../../utility/parse-project-id';

export const resolveSlots: RouteMiddleware = async context => {
  const site = await context.siteManager.getSiteBySlug(context.params.slug);

  if (!site) {
    throw new NotFound('not found');
  }

  const query = context.query;

  const slotCtx: {
    collection?: number;
    manifest?: number;
    canvas?: number;
    project?: number;
    topic?: string;
    topicType?: string;
    slotIds?: string[];
  } = {
    collection: query.collection ? Number(query.collection) : undefined,
    manifest: query.manifest ? Number(query.manifest) : undefined,
    canvas: query.canvas ? Number(query.canvas) : undefined,
    topic: query.topic ? query.topic : undefined,
    topicType: query.topicType ? query.topicType : undefined,
    slotIds: query.slotIds ? query.slotIds.split(',') : undefined,
  };

  const parsedId = context.query.project ? parseProjectId(context.query.project) : undefined;
  const project = parsedId ? await context.connection.one(getProject(parsedId, site.id)) : undefined;
  if (project) {
    slotCtx.project = project.id;
  }

  context.response.body = await context.pageBlocks.getSlotsByContext(slotCtx, site.id);
  context.response.status = 200;
};
