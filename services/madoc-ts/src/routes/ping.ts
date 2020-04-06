import { RouteMiddleware } from '../types';
import { mysql } from '../utility/mysql';

export const ping: RouteMiddleware = async context => {
  context.response.body = await new Promise(resolve =>
    context.mysql.query(mysql`SELECT * FROM resource_template LIMIT 5`, (err, results) => {
      resolve(results);
    })
  );
};
