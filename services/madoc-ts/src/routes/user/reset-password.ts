import { siteState } from '../../middleware/site-state';
import { RouteMiddleware } from '../../types/route-middleware';
import validate from 'uuid-validate';
import { accountFrontend } from '../frontend/account-frontend';
import { siteFrontend } from '../frontend/site-frontend';
import { buildAccountEntryPath, getAuthPathPrefix, isAccountRequestPath } from './account-route-helper';

const RESET_LINK_MAX_AGE_DAYS = 1;

export const resetPasswordPage: RouteMiddleware = async (context, next) => {
  const accountRequest = isAccountRequestPath(context.path);
  const authPathPrefix = getAuthPathPrefix(context.params.slug, accountRequest);
  const onActivateRoute = context.path.endsWith('/activate-account');
  const destinationPath = onActivateRoute ? 'activate-account' : 'reset-password';
  const renderAuthPage = async () => {
    if (accountRequest) {
      await accountFrontend(context, next);
      return;
    }

    await siteState(context, async () => {
      await siteFrontend(context, next);
    });
  };
  const renderErrorPage = async () => {
    context.reactFormResponse = { error: true };
    await renderAuthPage();
  };

  if (!accountRequest) {
    const site = await context.siteManager.getSiteBySlug(context.params.slug);
    if (!site.is_public && !context.state.jwt) {
      const query = context.querystring ? new URLSearchParams(context.querystring) : undefined;
      context.redirect(buildAccountEntryPath(destinationPath, context.params.slug, query));
      return;
    }
  }

  if (context.state.jwt) {
    context.redirect(`/s/${context.params.slug}`);
    return;
  }

  const c1 = context.query?.c1 || context.requestBody?.c1;
  const c2 = context.query?.c2 || context.requestBody?.c2;

  if (!c1 || !c2 || !validate(c1) || !validate(c2)) {
    await renderErrorPage();
    return;
  }

  try {
    const { created, activate } = await context.siteManager.getPasswordReset(c1, c2);

    const shouldExpire = new Date();
    shouldExpire.setDate(shouldExpire.getDate() - RESET_LINK_MAX_AGE_DAYS);
    if (shouldExpire.getTime() > created.getTime()) {
      await renderErrorPage();
      return;
    }

    context.reactFormResponse = { c1, c2, activate, error: false };

    if (context.method === 'POST') {
      const { p1, p2 } = context.requestBody;

      if (!p1 || !p2 || p1 !== p2) {
        context.reactFormResponse = { formError: true };
      } else {
        // Here is the where we change the password and/or activate.
        await context.siteManager.setUserPassword(c2, p1);

        context.redirect(`${authPathPrefix}/login?success=true`);
        return;
      }
    }
  } catch (e) {
    await renderErrorPage();
    return;
  }

  await renderAuthPage();
};
