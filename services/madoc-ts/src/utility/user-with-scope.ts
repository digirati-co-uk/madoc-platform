import { NotFound } from './errors/not-found';
import { ApplicationState } from '../types/application-state';

export function userWithScope(context: { state: ApplicationState }, scopes: string[]) {
  if (!context.state.jwt || !context.state.jwt.user.id) {
    throw new NotFound('No id');
  }

  for (const scope of scopes) {
    if (context.state.jwt.scope.indexOf(scope) === -1) {
      throw new NotFound('Scope');
    }
  }

  return {
    id: context.state.jwt.user.id,
    name: context.state.jwt.user.name,
    siteId: context.state.jwt.site.id,
    userUrn: `urn:madoc:user_${context.state.jwt.user.id}`,
  };
}
