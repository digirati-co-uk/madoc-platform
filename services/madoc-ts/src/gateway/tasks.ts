import { makeJsonRequest } from './api';

export async function getTaskById(id: string) {
  return makeJsonRequest<{ id: string }>(`/api/tasks/${id}`);
}
