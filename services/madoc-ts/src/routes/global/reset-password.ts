import { v4 } from 'uuid';
import { createResetPasswordEmail, createResetPasswordText } from '../../emails/reset-password-email';
import { gatewayHost } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { passwordHash } from '../../utility/php-password-hash';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const resetPassword: RouteMiddleware<{ userId: string }> = async context => {
  const { siteId } = await onlyGlobalAdmin(context);

  const site = await context.siteManager.getSiteById(siteId);

  const userId = Number(context.params.userId);

  const user = await context.siteManager.getUserById(userId);

  const idHash = v4(); // Stored in database and sent to user
  const codeForUser = v4(); // Only sent to user
  const sharedHash = await passwordHash(codeForUser); // Hashed stored in database

  await context.siteManager.resetUserPassword(idHash, sharedHash, userId, false);

  const systemConfig = await context.siteManager.getSystemConfig();

  const route = context.routes.url('reset-password', { slug: site.slug }, { query: `?c1=${codeForUser}&c2=${idHash}` });

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

  context.response.body = { accepted: true };
};
