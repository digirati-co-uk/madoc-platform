import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';

export const deleteTask: RouteMiddleware<{ id: string }> = async context => {
  throw new NotFound('Not yet implemented');
};
