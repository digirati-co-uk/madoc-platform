import { v4 } from 'uuid';
import { createUserActivationEmail, createUserActivationText } from '../../emails/user-activation-email';
import { UserCreationRequest } from '../../extensions/site-manager/types';
import { gatewayHost } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { ConflictError } from '../../utility/errors/conflict';
import { passwordHash } from '../../utility/php-password-hash';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const createUser: RouteMiddleware<unknown, UserCreationRequest> = async context => {
  const { siteId, id } = await onlyGlobalAdmin(context);

  const user = context.requestBody;

  const existingEmail = await context.siteManager.userEmailExists(user.email);

  if (existingEmail) {
    throw new ConflictError('Email already registered');
  }

  // Set creator
  user.creator = id;

  const createdUser = user.automated
    ? await context.siteManager.createAutomatedUser(user)
    : await context.siteManager.createUser(user);

  const idHash = v4(); // Stored in database and sent to user
  const codeForUser = v4(); // Only sent to user
  const sharedHash = await passwordHash(codeForUser); // Hashed stored in database
  const site = await context.siteManager.getSiteById(siteId);

  await context.siteManager.resetUserPassword(idHash, sharedHash, createdUser.id, true);

  const route = context.routes.url(
    'activate-account',
    { slug: site.slug },
    { query: `?c1=${codeForUser}&c2=${idHash}` }
  );

  // Don't send emails to BOT users, they don't have passwords.
  if (!user.automated && user.skipEmail) {
    // We want to return the link to activate for the administrator to share with the user.
    (createdUser as any).verificationLink = `${gatewayHost}${route}`;
  } else if (!user.automated) {
    try {
      const systemConfig = await context.siteManager.getSystemConfig();
      const vars = {
        resetLink: `${gatewayHost}${route}`,
        installationTitle: systemConfig.installationTitle,
        username: createdUser.name,
      };

      await context.mailer.sendMail(createdUser.email, {
        subject: `Activate your account`,
        text: createUserActivationText(vars),
        html: createUserActivationEmail(vars),
      });
    } catch (e) {
      (createdUser as any).emailError = true;
      (createdUser as any).verificationLink = `${gatewayHost}${route}`;
      // unknown email error.
    }
  }

  context.response.body = createdUser;
};
