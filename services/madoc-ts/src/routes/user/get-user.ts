import { User } from '../../types/omeka/User';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { mysql } from '../../utility/mysql';
import { userWithScope } from '../../utility/user-with-scope';

export const getUser: RouteMiddleware = async context => {
  userWithScope(context, ['site.admin']);

  const userId = context.params.id;

  const response = await new Promise<User[]>((resolve, reject) =>
    context.mysql.query(
      mysql`
        select user.id,
               user.name,
               user.email,
               user.role
        from user 
          left join site_permission sp 
              on user.id = sp.user_id 
        where sp.role is not null 
          and user.id = ${userId} 
        group by user_id limit 1
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

  if (response.length === 0) {
    throw new NotFound('User not found');
  }

  context.response.body = { user: response[0] };
};
