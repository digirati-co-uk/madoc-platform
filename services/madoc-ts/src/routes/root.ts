import { RouteMiddleware } from './../types/route-middleware';

export const siteRoot: RouteMiddleware = async context => {
  const system = await context.siteManager.getSystemConfig();

  if (system.defaultSite) {
    context.redirect(`/s/${system.defaultSite}`);
    return;
  }

  // @todo list of sites or similar? Possibly onboarding process.
  context.response.body = `
    <h1>Madoc</h1>
  `;
  context.response.status = 200;
};
