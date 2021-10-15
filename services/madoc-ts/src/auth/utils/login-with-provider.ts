import { sql } from 'slonik';
import { RouteMiddleware } from '../../types/route-middleware';

export const loginWithProvider: RouteMiddleware = async (context, next) => {
  if (context.isAuthenticated()) {
    const foundUser = await context.connection.maybeOne<{ id: number }>(sql`
      select * from "user" where federated_logins->${context.state.user.provider}->>'id' = ${context.state.user.id}
    `);

    if (foundUser) {
      const resp = await context.siteManager.getVerifiedLogin(foundUser.id);
      if (resp) {
        const { user, sites } = resp;
        context.state.authenticatedUser = {
          role: user.role,
          name: user.name,
          id: user.id,
          sites,
        };
      }
      // @todo how to get the site they came from?
      context.redirect('/');
      return;
    } else {
      // Register?
    }
  } else {
    // Login error.
  }

  await next();
};
