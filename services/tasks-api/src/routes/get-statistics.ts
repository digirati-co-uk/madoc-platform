import { RouteMiddleware } from '../types';
import { sql } from 'slonik';
import { NotFound } from '../errors/not-found';

export const getStatistics: RouteMiddleware<{ id?: string }> = async context => {
  const id = context.params.id;
  const root = Boolean(context.query.root || false);
  const whereRoot = id ? (root ? sql`root_task = ${id}` : sql`parent_task = ${id}`) : undefined;
  const whereType = context.query.type ? sql`type = ${context.query.type}` : undefined;
  const whereUser = context.query.user_id
    ? sql`(creator_id = ${context.query.user_id} or assignee_id = ${context.query.user_id})`
    : undefined;
  const whereContext = sql`context ?& ${sql.array(context.state.jwt.context, 'text')}`;
  const counter = context.query.distinct_subjects ? sql`count(distinct subject)` : sql`count(*)`;
  const fullWhere = sql.join([whereRoot, whereType, whereUser, whereContext].filter(Boolean) as any[], sql` and `);
  const isAdmin = context.state.jwt.scope.indexOf('tasks.admin') !== -1;
  const canCreate = context.state.jwt.scope.indexOf('tasks.create') !== -1;

  // Permissions.
  if (!isAdmin && !canCreate) {
    if (!id && !whereUser) {
      throw new NotFound();
    }
    if (context.query.user_id !== context.state.jwt.user.id) {
      throw new NotFound();
    }
  }

  const query = await context.connection.any(
    sql<{
      status: number;
      total: number;
    }>`select ${counter} as total, status from tasks where ${fullWhere} group by status`
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
