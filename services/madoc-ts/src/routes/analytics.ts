import { getProject } from '../database/queries/project-queries';
import { AnalyticsRepository } from '../repository/analytics-repository';
import { RouteMiddleware } from '../types/route-middleware';
import { RecordPageViewRequest } from '../types/schemas/analytics';
import { NotFound } from '../utility/errors/not-found';
import { RequestError } from '../utility/errors/request-error';
import { parseProjectId } from '../utility/parse-project-id';
import { onlyGlobalAdmin, userWithScope } from '../utility/user-with-scope';

export const getAnalytics: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const { scope = 'site', days = '30' } = context.query;
  if ((scope !== 'site' && scope !== 'all') || typeof days !== 'string' || !/^(7|30|90|365)$/.test(days)) {
    throw new RequestError('Choose a site or all sites and a range of 7, 30, 90 or 365 days.');
  }
  if (scope === 'all') await onlyGlobalAdmin(context);
  context.set('Cache-Control', 'private, no-store');
  context.body = await new AnalyticsRepository(context.connection).report(
    scope === 'all' ? null : siteId,
    Number(days)
  );
};

export const recordPageView: RouteMiddleware<{ slug: string }, RecordPageViewRequest> = async context => {
  // Only the site browser sends this write-only endpoint. Authentication status is server-derived.
  const origin = context.get('origin');
  // TLS terminates at the gateway, so Koa sees HTTP even for HTTPS browsers.
  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    throw new NotFound();
  }
  if (
    !['http:', 'https:'].includes(originUrl.protocol) ||
    originUrl.host !== context.host ||
    (context.get('sec-fetch-site') && context.get('sec-fetch-site') !== 'same-origin')
  )
    throw new NotFound();
  const body: unknown = context.requestBody;
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    Object.keys(body).some(key => key !== 'project') ||
    (context.requestBody.project !== undefined &&
      (typeof context.requestBody.project !== 'string' ||
        context.requestBody.project.length === 0 ||
        context.requestBody.project.length > 200))
  ) {
    throw new RequestError('Invalid page view');
  }
  const jwt = context.state.jwt;
  if (jwt?.user.service) throw new NotFound();
  const signedIn = !!jwt?.user.id;
  const site = await context.siteManager.getCachedSiteIdBySlug(
    context.params.slug,
    signedIn ? jwt?.user.id : undefined,
    !!jwt?.scope.includes('site.admin')
  );
  if (jwt && jwt.site.id !== site.id) throw new NotFound();
  let projectId = 0;
  if (context.requestBody.project) {
    const parsed = parseProjectId(context.requestBody.project);
    if (parsed.projectId !== undefined && (!Number.isSafeInteger(parsed.projectId) || parsed.projectId <= 0)) {
      throw new RequestError('Invalid project');
    }
    const project = await context.connection.maybeOne(getProject(parsed, site.id));
    if (!project) throw new NotFound();
    projectId = project.id;
  }
  await new AnalyticsRepository(context.connection).recordPageView(site.id, projectId, signedIn);
  context.set('Cache-Control', 'no-store');
  context.status = 204;
};
