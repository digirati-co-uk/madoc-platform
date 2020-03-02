import { FullSingleTask, RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';

export const createSubtask: RouteMiddleware<{ id: string }, FullSingleTask> = async context => {
  throw new NotFound('Not yet implemented');
};
