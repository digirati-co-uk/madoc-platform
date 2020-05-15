import { RouteMiddleware } from '../types';
import { sql } from 'slonik';

export const getStatistics: RouteMiddleware<{ id: string }> = async context => {
  const id = context.params.id;
  const root = Boolean(context.query.root || false);
  const whereClause = root ? sql`root_task = ${id}` : sql`parent_task = ${id}`;

  const query = await context.connection.any(
    sql<{
      status: number;
      total: number;
    }>`select count(*) as total, status from tasks where ${whereClause} group by status`
  );

  context.response.body = {
    statuses: query.reduce((state, next) => {
      state[next.status] = next.total;
      return state;
    }, {} as { [key: string]: number }),
  };
};
