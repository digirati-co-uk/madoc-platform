import { sql, ValueExpressionType } from 'slonik';

export const inserts = (rows: ValueExpressionType[]) => {
  // Produces:
  // ( rows[0] ),
  // ( rows[1] ),
  // ...
  // ( rows[n] )
  return sql.join(
    rows.map(row => sql`(${row})`),
    sql`,`
  );
};

export function upsert<T, Return = T>(
  table: string,
  primaryKeys: Array<keyof T>,
  inputData: T[],
  keys: Array<keyof T>,
  { jsonKeys = [], dateKeys = [] }: { jsonKeys?: Array<keyof T>; dateKeys?: Array<keyof T> } = {}
) {
  return sql<Return>`
        insert into ${sql.identifier([table])} (${sql.join(
    keys.map(key => sql.identifier([key as string])),
    sql`,`
  )})  values
            ${inserts(
              inputData.map((dataItem: any) => {
                return sql`${sql.join(
                  keys.map(key => {
                    if (jsonKeys.indexOf(key) !== -1) {
                      if (!dataItem[key]) {
                        return null;
                      }
                      return sql.json(dataItem[key]) || null;
                    }
                    if (dateKeys.indexOf(key) !== -1) {
                      return new Date(dataItem[key])
                        .toISOString()
                        .replace('T', ' ')
                        .replace('Z', '');
                    }

                    return dataItem[key];
                  }),
                  sql`,`
                )}`;
              })
            )}
             on conflict (${sql.join(
               primaryKeys.map(key => sql.identifier([key as string])),
               sql`,`
             )}) do update
             set 
                ${sql.join(
                  keys.map(
                    key => sql`${sql.identifier([key as string])} = ${sql.identifier(['excluded', key as string])}`
                  ),
                  sql`,`
                )};
    `;
}

export function sqlDate(dateLike: Date) {
  return sql`${dateLike
    .toISOString()
    .replace('T', ' ')
    .replace('Z', '')}::date`;
}
