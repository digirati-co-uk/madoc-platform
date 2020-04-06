import { escape } from 'mysql';

const $$raw = Symbol();

export function mysql(strings: TemplateStringsArray, ...values: any[]) {
  return strings
    .map((s, index) => (index < values.length ? `${s}${values[index] && values[index][$$raw] ? values[index].sql : escape(values[index])}` : s))
    .join('');
}

export function raw(sql: string) {
  return { [$$raw]: true, sql };
}
