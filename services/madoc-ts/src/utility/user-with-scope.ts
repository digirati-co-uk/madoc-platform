import { NotFound } from './errors/not-found';
import { ApplicationState } from '../types/application-state';

export function userWithScope(context: { state: ApplicationState }, scopes: string[]) {
  if (!context.state.jwt || !context.state.jwt.user.id) {
    throw new NotFound('No id');
  }

  if (context.state.jwt.scope.indexOf('site.admin') === -1) {
    for (const scope of scopes) {
      if (context.state.jwt.scope.indexOf(scope) === -1) {
        throw new NotFound('Scope');
      }
    }
  }

  return {
    id: context.state.jwt.user.id,
    name: context.state.jwt.user.name,
    siteId: context.state.jwt.site.id,
    siteUrn: `urn:madoc:site:${context.state.jwt.site.id}`,
    userUrn: `urn:madoc:user:${context.state.jwt.user.id}`,
  };
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
    };
  }

  return {
    id: context.state.jwt.user.id,
    name: context.state.jwt.user.name,
    siteId: context.state.jwt.site.id,
    siteUrn: `urn:madoc:site:${context.state.jwt.site.id}`,
    userUrn: `urn:madoc:user:${context.state.jwt.user.id}`,
  };
}
