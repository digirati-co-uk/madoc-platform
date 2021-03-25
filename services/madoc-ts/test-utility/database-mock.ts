import { SqlSqlTokenType } from 'slonik/src/types';

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

  mockQuery(sqlText: string, response: any, assertParams?: (params: any) => void) {
    this.mockStack[sqlText] = this.mockStack[sqlText] ? this.mockStack[sqlText] : [];
    this.mockStack[sqlText].push({ response, assertParams });
  }

  attachMock(context: any) {
    context.connection = context.connection ? context.connection : {};
    context.connection.query = this.handleQuery;
    context.connection.one = this.handleQuery;
  }

  handleQuery = (sqlTag: SqlSqlTokenType) => {
    const sqlText = sqlTag.sql;
    if (!this.mockStack[sqlText] || !this.mockStack[sqlText].length) {
      throw new Error(`No mock available.
Mock this sql using the following:

    db.mockQuery(\`${sqlText}\`, {  });
  
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
}
