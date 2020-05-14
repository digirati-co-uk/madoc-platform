import { escape } from 'mysql';

const $$raw = Symbol();

export function mysql(strings: TemplateStringsArray, ...values: any[]) {
  const query = strings
    .map((s, index) =>
      index < values.length
        ? `${s}${values[index] && values[index][$$raw] ? values[index].sql : escape(values[index])}`
        : s
    )
    .join('');
  return query;
}

export function raw(sql: string) {
  return { [$$raw]: true, sql };
}
