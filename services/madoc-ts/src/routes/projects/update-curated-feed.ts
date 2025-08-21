import { NotFoundError } from 'slonik';
import { getProject } from '../../database/queries/project-queries';
import { api, gatewayHost } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { parseProjectId } from '../../utility/parse-project-id';
import { optionalUserWithScope } from '../../utility/user-with-scope';

const feedMap = {
  curated: 'curated-project-manifests',
  manifest: 'project-manifest-feed',
  published: 'published-project-manifests',
};

const messageMap = {
  curated: `Manifest manually published in project`,
  manifest: `Manifest completed in project`,
  published: `Project completed`,
};

export const updateCuratedFeed: RouteMiddleware<
  { id: string; feed: string },
  { manifestId: number }
> = async context => {
  const { id, siteId } = optionalUserWithScope(context, ['tasks.create']);
  const parsedId = context.params.id ? parseProjectId(context.params.id) : null;
  const project = parsedId ? await context.connection.one(getProject(parsedId, siteId)) : null;
  const primaryStream = (feedMap as any)[context.params.feed];
  const summary = (messageMap as any)[context.params.feed];
  const userApi = api.asUser({ userId: id, siteId });
  const site = await context.siteManager.getSiteById(siteId);

  if (!primaryStream) {
    throw new NotFoundError();
  }

  const manifestId = context.requestBody.manifestId;

  const manifest = await userApi.getManifestById(manifestId);
  const label = (Object.values(manifest.manifest.label)[0] || [])[0];

  if (!project) {
    console.log('project not found');
  }

  if (!site) {
    console.log('Site not found', siteId);
  }

  if (!project || !site) {
    throw new NotFoundError();
  }

  await userApi.postToActivityStream(
    {
      primaryStream,
      secondaryStream: project.slug,
      action: 'update',
    },
    {
      summary,
      object: {
        id: `${gatewayHost}/s/${site.slug}/madoc/api/projects/${project.slug}/export/manifest/${manifestId}/3.0`,
        type: 'Manifest',
        name: label ? label : undefined,
        canonical: `urn:madoc:manifest:${manifestId}`,
      },
    },
    {
      primaryObjectId: `${gatewayHost}/s/${site.slug}/madoc/api/manifests/${manifestId}/export/3.0`,
    }
  );

  context.response.status = 201;
};
