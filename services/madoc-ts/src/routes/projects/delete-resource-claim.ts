import { RouteMiddleware } from '../../types/route-middleware';

export const deleteResourceClaim: RouteMiddleware = async context => {
  // If delete claim on manifest:
  // 1. Delete manifest task
  // 2. Mark all canvases as error

  // If delete claim on canvas:
  // 1. Mark task as error

  context.response.body = { test: 'deleteResourceClaim' };
};
