import { User } from '../../types/omeka/User';
import { RouteMiddleware } from '../../types/route-middleware';
import { mysql } from '../../utility/mysql';
import { userWithScope } from '../../utility/user-with-scope';

export const userAutocomplete: RouteMiddleware = async context => {
  // @todo need scope for reading user data.
  const { id, siteId } = userWithScope(context, ['tasks.create']);
  const q = (context.query.q || '').trim();
  const query = `%${q || ''}%`;

  if (!context.query.q) {
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
               user.role
        from user 
          left join site_permission sp 
              on user.id = sp.user_id 
        where sp.role is not null 
          and user.name LIKE ${query}  and sp.site_id = ${siteId}
        group by user_id limit 10
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
