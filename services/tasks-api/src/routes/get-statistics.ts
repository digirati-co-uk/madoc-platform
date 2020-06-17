import { RouteMiddleware } from '../types';
import { sql } from 'slonik';

export const getStatistics: RouteMiddleware<{ id: string }> = async context => {
  const id = context.params.id;
  const root = Boolean(context.query.root || false);
  const whereRoot = root ? sql`root_task = ${id}` : sql`parent_task = ${id}`;
  const whereType = context.query.type ? sql`and type = ${context.query.type}` : sql``;
  const counter = context.query.distinct_subjects ? sql`count(distinct subject)` : sql`count(*)`;

  const query = await context.connection.any(
    sql<{
      status: number;
      total: number;
    }>`select ${counter} as total, status from tasks where ${whereRoot} ${whereType} group by status`
  );

  let total = 0;
  const statuses = query.reduce((state, next) => {
    state[next.status] = next.total;
    total += next.total;
    return state;
  }, {} as { [key: string]: number });

  context.response.body = {
    statuses,
    total,
  };
};
