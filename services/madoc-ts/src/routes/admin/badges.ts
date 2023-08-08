import { AwardBadgeRequest, CreateBadgeRequest } from '../../types/badges';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const createBadge: RouteMiddleware<{}, CreateBadgeRequest> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  context.response.body = await context.siteManager.createBadge(context.requestBody, siteId);
  context.response.status = 201;
};

export const updateBadge: RouteMiddleware<{ id: string }, CreateBadgeRequest> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  context.response.body = await context.siteManager.updateBadge(
    { id: context.params.id, ...context.requestBody },
    siteId
  );
  context.response.status = 200;
};

export const getBadge: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  context.response.body = await context.siteManager.getBadge(context.params.id, siteId);
};

export const deleteBadge: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  await context.siteManager.deleteBadge(context.params.id, siteId);
  context.response.status = 204;
};

export const listBadges: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  context.response.body = { badges: await context.siteManager.listBadges(siteId) };
};

export const listUserAwardedBadges: RouteMiddleware<{ userId: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const userId = context.params.userId;
  context.response.body = { awards: await context.siteManager.listUserAwardedBadges(Number(userId), siteId) };
};

export const getAwardedBadge: RouteMiddleware<{ id: string; userId: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const id = context.params.id;
  const userId = context.params.userId;
  context.response.body = await context.siteManager.getAwardedBadge(id, Number(userId), siteId);
};

export const awardBadge: RouteMiddleware<{ userId: string }, AwardBadgeRequest> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const body = context.requestBody;
  context.response.body = await context.siteManager.awardBadge(body, Number(context.params.userId), siteId);
  context.response.status = 201;
};

export const removeAwardedBadge: RouteMiddleware<{ id: string; userId: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  await context.siteManager.removeAwardedBadge(context.params.id, Number(context.params.userId), siteId);
  context.response.status = 204;
};
