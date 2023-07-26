import { RouteMiddleware } from '../../types/route-middleware';

export const siteTerms: RouteMiddleware = async context => {
  const { siteApi } = context.state;

  const latest: any = await siteApi.siteManager.getLatestTerms();

  if (context.query.id) {
    latest.selected = await siteApi.siteManager.getTermsById(context.query.id);
  }

  context.response.body = latest;
};
