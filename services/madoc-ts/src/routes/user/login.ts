import { siteState } from '../../middleware/site-state';
import { RouteMiddleware } from '../../types/route-middleware';
import { siteFrontend } from '../admin/frontend';

export const loginPage: RouteMiddleware<{ slug: string }, { email: string; password: string }> = async (
  context,
  next
) => {
  const success = Boolean(context.query.success);

  if (context.query.redirect && !context.query.redirect.startsWith('/')) {
    context.query.redirect = '';
  }

  if (context.state.jwt) {
    context.response.redirect(context.query.redirect || `/s/${context.params.slug}`);
    return;
  }

  if (context.request.method === 'POST') {
    const { email, password } = context.requestBody || {};
    try {
      const resp = await context.siteManager.verifyLogin(email, password);
      if (resp) {
        const { user, sites } = resp;
        // Authenticate
        context.state.authenticatedUser = {
          role: user.role,
          name: user.name,
          id: user.id,
          sites,
        };

        context.response.redirect(context.query.redirect || `/s/${context.params.slug}`);
        return;
      } else {
        context.reactFormResponse = { loginError: true, email };
      }
    } catch (err) {
      console.log(err);
      context.reactFormResponse = { loginError: true, email };
    }
  }

  context.reactFormResponse = context.reactFormResponse || {};
  if (success) {
    context.reactFormResponse.success = true;
  }

  await siteState(context, async () => {
    await siteFrontend(context, next);
  });
};
