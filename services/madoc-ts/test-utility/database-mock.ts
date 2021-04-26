import { SqlSqlTokenType } from 'slonik/src/types';
import { MockTaggedWrapper } from './utils';

function normalizeSql(str: string) {
  return str.replace(/\s\s+/g, ' ').trim();
}

export class DatabaseMock {
  mockStack: {
    [sql: string]: Array<{
      response: any;
      assertParams?: (params: any) => void;
    }>;
  } = {};

  constructor() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error();
    }
  }

  mockQuery<Response = any, Params = any>(
    sqlTextInput: string | MockTaggedWrapper<Response, Params>,
    response: Response,
    assertParams?: (params: Params) => void
  ) {
    const sqlText = normalizeSql(sqlTextInput);
    this.mockStack[sqlText] = this.mockStack[sqlText] ? this.mockStack[sqlText] : [];
    this.mockStack[sqlText].push({ response, assertParams });
  }

  attachMock(context: any) {
    context.connection = context.connection ? context.connection : {};
    context.connection.query = this.handleQuery;
    context.connection.one = this.handleQuery;
  }

  handleQuery = (sqlTag: SqlSqlTokenType) => {
    const sqlText = normalizeSql(sqlTag.sql);
    if (!this.mockStack[sqlText] || !this.mockStack[sqlText].length) {
      throw new Error(`No mock available.
Mock this sql using the following:

    db.mockQuery(\`${sqlTag.sql}\`, {  });
  
      `);
    }

    const { assertParams, response } = this.mockStack[sqlText].shift() as any;

    if (assertParams) {
      assertParams(sqlTag.values);
    }
    return response;
  };

  queueSize() {
    const keys = Object.keys(this.mockStack);
    let size = 0;
    for (const key of keys) {
      const stackItem = this.mockStack[key];
      size += stackItem.length;
    }
    return size;
  }

  assertEmpty() {
    const keys = Object.keys(this.mockStack);
    const remaining = [];
    for (const key of keys) {
      const stackItem = this.mockStack[key];
      if (stackItem.length) {
        remaining.push(key);
      }
    }

    if (remaining.length) {
      throw new Error(`
The following queries were not used:

${remaining.join('\n\n')}
      `);
    }
  }
}
