import { FullSingleTask, RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';

export const createTask: RouteMiddleware<{}, FullSingleTask> = async context => {
  throw new NotFound('Not yet implemented');
};
