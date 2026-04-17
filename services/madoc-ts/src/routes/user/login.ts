import { siteState } from '../../middleware/site-state';
import { RouteMiddleware } from '../../types/route-middleware';
import { accountFrontend } from '../frontend/account-frontend';
import { siteFrontend } from '../frontend/site-frontend';
import { isAccountRequestPath, SITE_PATH_PREFIX } from './account-route-helper';

export const loginPage: RouteMiddleware<{ slug: string }, { email: string; password: string }> = async (
  context,
  next
) => {
  const accountRequest = isAccountRequestPath(context.path);
  const renderAuthPage = async () => {
    if (accountRequest) {
      await accountFrontend(context, next);
      return;
    }

    await siteState(context, async () => {
      await siteFrontend(context, next);
    });
  };

  if (context.query.redirect && !context.query.redirect.startsWith('/')) {
    context.query.redirect = '';
  }
  const redirectTarget = context.query.redirect || `${SITE_PATH_PREFIX}/${context.params.slug}`;

  if (context.state.jwt) {
    context.response.redirect(redirectTarget);
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

        context.response.redirect(redirectTarget);
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
  if (context.query.success) {
    context.reactFormResponse.success = true;
  }

  await renderAuthPage();
};
