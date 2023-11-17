import invariant from 'tiny-invariant';
import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope, userWithScope } from '../../utility/user-with-scope';

export const getTermsById: RouteMiddleware<{ termsId: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.view']);

  context.response.body = await context.siteManager.getTermsById(context.params.termsId, siteId);
};

export const getLatestTerms: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.view']);

  const allTerms = await context.siteManager.listTerms(siteId, { snippet: true });
  context.response.body = {
    latest: await context.siteManager.getLatestTerms(siteId),
    list: allTerms,
  };
};

export const listTerms: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.view']);

  const snippet = context.query.snippet === 'true';

  context.response.body = { terms: await context.siteManager.listTerms(siteId, { snippet }) };
};

export const createTerms: RouteMiddleware<{}, { text: string; markdown: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  invariant(context.requestBody, 'Request body must be provided');
  invariant(context.requestBody.text, 'Request body must contain text');
  invariant(context.requestBody.markdown, 'Request body must contain markdown');

  context.response.body = await context.siteManager.createTerms(context.requestBody, siteId);
};

export const deleteTerms: RouteMiddleware<{ termsId: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  context.response.body = await context.siteManager.deleteTerms(context.params.termsId, siteId);
};

export const acceptTerms: RouteMiddleware = async context => {
  const { id, siteId } = userWithScope(context, ['site.view']);
  const latest = await context.siteManager.getLatestTerms(siteId);
  invariant(latest, 'No terms found');
  context.response.body = await context.siteManager.acceptTerms(id, latest.id);
};
