import { RouteMiddleware } from '../types';
import { escape } from 'mysql';

function mysql(strings: TemplateStringsArray, ...values: any[]) {
  return strings.map((s, index) => (index < values.length ? `${s}${escape(values[index])}` : s)).join('');
}

export const ping: RouteMiddleware = async context => {
  context.response.body = await new Promise(resolve =>
    context.mysql.query(mysql`SELECT * FROM resource_template LIMIT 5`, (err, results) => {
      resolve(results);
    })
  );
};
