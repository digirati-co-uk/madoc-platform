import { RouteMiddleware } from '../../types/route-middleware';

export const deleteResourceClaim: RouteMiddleware = async context => {
  // If delete claim on manifest:
  // 1. Unassign user from manifest
  // 2. Mark all tasks as error
  // 3. Status abandoned
  // 4. Delete all capture model revisions

  // If delete claim on canvas:
  // 1. Mark task as error
  // 2. Delete capture model revision.

  context.response.body = { test: 'deleteResourceClaim' };
};
