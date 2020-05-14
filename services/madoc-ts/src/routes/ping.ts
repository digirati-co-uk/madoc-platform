import { mysql } from '../utility/mysql';
import { RouteMiddleware } from '../types/route-middleware';

export const ping: RouteMiddleware = async context => {
  context.response.body = await new Promise(resolve =>
    context.mysql.query(mysql`SELECT * FROM resource_template LIMIT 5`, (err, results) => {
      resolve(results);
    })
  );
};
