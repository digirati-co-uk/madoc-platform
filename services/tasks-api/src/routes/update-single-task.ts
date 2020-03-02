import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';

export const updateSingleTask: RouteMiddleware<{ id: string }> = async context => {
  throw new NotFound('Not yet implemented');
};
