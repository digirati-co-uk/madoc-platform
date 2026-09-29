import { RouteMiddleware } from '../types';
import { sql } from 'slonik';
import { NotFound } from '../errors/not-found';

export const getStatistics: RouteMiddleware<{ id?: string }> = async (context) => {
  const id = context.params.id;
  const root = Boolean(context.query.root || false);
  const whereRoot = id ? (root ? sql`root_task = ${id}` : sql`parent_task = ${id}`) : undefined;
  const whereType = context.query.type ? sql`type = ${context.query.type}` : undefined;
  const whereStatus = context.query.status ? sql`status = ${Number(context.query.status)}` : undefined;
  const whereUser = context.query.user_id
    ? sql`(creator_id = ${context.query.user_id} or assignee_id = ${context.query.user_id})`
    : undefined;
  const whereContext = sql`context ?& ${sql.array(context.state.jwt.context, 'text')}::text[]`;
  const counter = context.query.distinct_subjects ? sql`count(distinct subject)` : sql`count(*)`;
  const fullWhere = sql.join(
    [whereRoot, whereType, whereUser, whereContext, whereStatus].filter(Boolean) as any[],
    sql` and `
  );
  const isAdmin = context.state.jwt.scope.indexOf('tasks.admin') !== -1;
  const canCreate = context.state.jwt.scope.indexOf('tasks.create') !== -1;
  const groupBy = context.query.group_by;
  let groupByQuery = sql`group by status`;
  let returnField = 'status';
  let selectField = sql`status`;
  switch (groupBy) {
    case 'creator':
      groupByQuery = sql`group by creator_id`;
      returnField = 'creator_id';
      selectField = sql`creator_id`;
      break;
    case 'assignee':
      groupByQuery = sql`group by assignee_id`;
      returnField = 'assignee_id';
      selectField = sql`assignee_id`;
      break;
  }

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
    }>`select ${counter} as total, ${selectField} from tasks where ${fullWhere} ${groupByQuery}`
  );

  if (returnField === 'status') {
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
  } else {
    let total = 0;
    const statuses = query.reduce((state, next: any) => {
      (state as any)[next[returnField]] = next.total;
      total += next.total;
      return state;
    }, {} as { [key: string]: number });

    context.response.body = {
      [returnField]: statuses,
      total,
    };
  }
};
