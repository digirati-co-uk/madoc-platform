import { SiteUserRepository } from '../repository/site-user-repository';
import { NotFound } from './errors/not-found';
import { ApplicationState } from '../types/application-state';

export function userWithScope(context: { state: ApplicationState; cookies: any }, scopes: string[]) {
  if (!context.state.jwt || !context.state.jwt.user.id) {
    throw new NotFound('No id');
  }

  if (context.state.jwt.scope.length === 0) {
    throw new NotFound(`Invalid token`);
  }

  if (context.state.jwt.scope.indexOf('site.admin') === -1) {
    for (const scope of scopes) {
      if (context.state.jwt.scope.indexOf(scope) === -1) {
        throw new NotFound(`Scope ${scope} required.`);
      }
    }
  }

  return {
    id: context.state.jwt.user.id,
    name: context.state.jwt.user.name,
    siteId: context.state.jwt.site.id,
    siteName: context.state.jwt.site.name,
    scope: context.state.jwt.scope,
    siteUrn: `urn:madoc:site:${context.state.jwt.site.id}`,
    userUrn: `urn:madoc:user:${context.state.jwt.user.id}`,
  };
}

export async function onlyGlobalAdmin(context: {
  siteManager: SiteUserRepository;
  state: ApplicationState;
  cookies: any;
}) {
  const scope = userWithScope(context, ['site.admin']);
  const user = await context.siteManager.getSiteUserById(scope.id, scope.siteId);
  if (user.role !== 'global_admin') {
    throw new NotFound();
  }

  return scope;
}

export function optionalUserWithScope(context: { state: ApplicationState }, scopes: string[]) {
  if (!context.state.jwt) {
    throw new NotFound('No JWT');
  }

  if (context.state.jwt.scope.indexOf('site.admin') === -1) {
    for (const scope of scopes) {
      if (context.state.jwt.scope.indexOf(scope) === -1) {
        throw new NotFound('Scope');
      }
    }
  }

  if (context.state.jwt.user.service) {
    return {
      siteId: context.state.jwt.site.id,
      siteUrn: `urn:madoc:site:${context.state.jwt.site.id}`,
      siteName: `urn:madoc:site:${context.state.jwt.site.name}`,
      service: true,
    };
  }

  return {
    id: context.state.jwt.user.id,
    name: context.state.jwt.user.name,
    siteId: context.state.jwt.site.id,
    siteUrn: `urn:madoc:site:${context.state.jwt.site.id}`,
    userUrn: `urn:madoc:user:${context.state.jwt.user.id}`,
    siteName: context.state.jwt.site.name,
    service: false,
  };
}
