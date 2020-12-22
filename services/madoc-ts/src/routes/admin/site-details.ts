import { Site } from '../../types/omeka/Site';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { mysql } from '../../utility/mysql';
import { userWithScope } from '../../utility/user-with-scope';

export const getSiteDetails: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const site = await new Promise<Site>(resolve =>
    context.mysql.query(mysql`select * from site where site.id = ${siteId}`, (err, data) => {
      resolve(data[0]);
    })
  );

  if (!site || !site.slug) {
    throw new NotFound('Site not found');
  }

  context.response.body = site;
};
