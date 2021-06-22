import { User } from '../../types/omeka/User';
import { RouteMiddleware } from '../../types/route-middleware';
import { mysql, raw } from '../../utility/mysql';
import { userWithScope } from '../../utility/user-with-scope';

export const userAutocomplete: RouteMiddleware = async context => {
  // @todo need scope for reading user data.
  const { id, siteId } = userWithScope(context, ['tasks.create']);
  const q = (context.query.q || '').trim();
  const roles = (context.query.roles || '')
    .split(',')
    .map((r: string) => r.trim())
    .filter((e: string) => e);
  const query = `%${q || ''}%`;

  if (!context.query.q && !roles.length) {
    context.response.body = {
      users: [],
    };
    return;
  }

  const response = await new Promise<User[]>((resolve, reject) =>
    context.mysql.query(
      mysql`
        select user.id,
               user.name,
               sp.role as role
        from user 
          left join site_permission sp 
              on user.id = sp.user_id 
        where sp.role is not null 
          ${q ? raw(mysql`and user.name LIKE ${query}`) : raw('')}  
          and sp.site_id = ${siteId} 
          ${roles.length ? raw(mysql`and sp.role IN (${roles})`) : raw('')}
        group by user_id limit 50
      `,
      (err, results: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(results as User[]);
        }
      }
    )
  );

  context.response.body = {
    users: response,
  };
};
