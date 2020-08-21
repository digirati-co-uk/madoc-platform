import { escape, Query } from 'mysql';

const $$raw = Symbol();

export function raw(sql: string) {
  return { [$$raw]: true, sql };
}

export function mysql(strings: TemplateStringsArray, ...values: any[]): string {
  if (strings.length === 1) {
    return raw(strings[0]) as any;
  }

  return strings
    .map((s, index) =>
      index < values.length
        ? `${s}${values[index] && values[index][$$raw] ? values[index].sql : escape(values[index])}`
        : s
    )
    .join('');
}
