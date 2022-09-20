import { ApplicationState } from '../types/application-state';

export function userCan(scope: string, state: ApplicationState, adminScope = 'site.admin') {
  return state.jwt && (state.jwt.scope.indexOf(adminScope) !== -1 || state.jwt.scope.indexOf(scope) !== -1);
}
