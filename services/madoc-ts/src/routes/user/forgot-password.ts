import { v4 } from 'uuid';
import { createResetPasswordEmail, createResetPasswordText } from '../../emails/reset-password-email';
import { gatewayHost } from '../../gateway/api.server';
import { siteState } from '../../middleware/site-state';
import { RouteMiddleware } from '../../types/route-middleware';
import { passwordHash } from '../../utility/php-password-hash';
import { accountFrontend } from '../frontend/account-frontend';
import { siteFrontend } from '../frontend/site-frontend';
import { isAccountRequestPath } from './account-route-helper';

export const forgotPassword: RouteMiddleware = async (context, next) => {
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
  const redirectTarget = context.query.redirect || `/s/${context.params.slug}`;

  // For logged in users.
  if (context.state.jwt) {
    context.response.redirect(redirectTarget);
    return;
  }

  if (context.request.method === 'POST') {
    const { email } = context.requestBody || {};

    // Check and send email.
    try {
      const user = await context.siteManager.getUserByEmail(email);
      if (user.is_active) {
        const site = await context.siteManager.getSiteBySlug(context.params.slug);
        const systemConfig = await context.siteManager.getSystemConfig();

        const idHash = v4(); // Stored in database and sent to user
        const codeForUser = v4(); // Only sent to user
        const sharedHash = await passwordHash(codeForUser); // Hashed stored in database

        await context.siteManager.resetUserPassword(idHash, sharedHash, user.id, false);

        const route = context.routes.url(
          !site.is_public || accountRequest ? 'account-reset-password' : 'reset-password',
          { slug: site.slug },
          { query: `?c1=${codeForUser}&c2=${idHash}` }
        );

        const vars = {
          resetLink: `${gatewayHost}${route}`,
          installationTitle: systemConfig.installationTitle,
          username: user.name,
        };

        await context.mailer.sendMail(user.email, {
          subject: `Password reset`,
          text: createResetPasswordText(vars),
          html: createResetPasswordEmail(vars),
        });
      }
    } catch (e) {
      // do nothing.
    }

    // Always report success, do not leak if email exists.
    context.reactFormResponse = {
      forgotSuccess: true,
    };
  }

  await renderAuthPage();
};
