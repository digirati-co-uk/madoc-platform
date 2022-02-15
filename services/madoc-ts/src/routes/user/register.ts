import { generateId } from '@capture-models/helpers';
import { v4 } from 'uuid';
import { createUserActivationEmail, createUserActivationText } from '../../emails/user-activation-email';
import { gatewayHost } from '../../gateway/api.server';
import { renderFrontend } from '../../middleware/render-frontend';
import { RouteMiddleware } from '../../types/route-middleware';
import { passwordHash } from '../../utility/php-password-hash';

export const registerPage: RouteMiddleware = async (context, next) => {
  if (context.query.redirect && !context.query.redirect.startsWith('/')) {
    context.query.redirect = '';
  }

  const userId = context.state.jwt?.user?.id;
  const isLoggedIn = !!(context.state.jwt && userId);

  const invitationId = context.query.code || context.requestBody?.code;
  const site = await context.siteManager.getSiteBySlug(context.params.slug);
  const systemConfig = await context.siteManager.getSystemConfig();
  const invitation = invitationId ? await context.siteManager.getInvitation(invitationId, site.id) : null;
  if (!systemConfig.enableRegistrations) {
    return context.redirect(`/s/${site.slug}/login`);
  }

  context.reactFormResponse = {
    invitation: invitation
      ? {
          id: invitation.id,
          message: invitation.detail.message,
          role: invitation.detail.role,
          site_role: invitation.detail.site_role,
        }
      : null,
  };

  if (invitation && invitation.detail && (!invitation.detail.usesLeft || invitation.detail.usesLeft <= 0)) {
    // Expired invitation.
    context.reactFormResponse = { expired: true };
  }

  if (invitation && invitation.expires && new Date().getTime() > invitation.expires.getTime()) {
    // Expired invitation.
    context.reactFormResponse = { expired: true };
  }

  // Should we tell the user to go?
  // - isLoggedIn
  // - Does the invite allow for existing users to accept? (default: true)
  // - Does the user already have site permissions?
  if (isLoggedIn) {
    // @todo more in the config to control this. But simplified for now.
    if (!userId || !invitation || !invitation.config.allowExistingUsers) {
      return context.redirect(`/s/${site.slug}/login`);
    }

    const user = await context.siteManager.getSiteUserById(userId, site.id);
    if (user.site_role && user.site_role !== 'viewer') {
      return context.redirect(`/s/${site.slug}`);
    }
  }

  if (context.method === 'POST' && !context.reactFormResponse.expired) {
    if (isLoggedIn && userId) {
      const user = await context.siteManager.getSiteUserById(userId, site.id);

      if (invitation && (!user.site_role || user.site_role === 'viewer')) {
        await context.siteManager.setUsersRoleOnSite(site.id, userId, invitation.detail.site_role);
        await context.siteManager.createInvitationRedemption(invitationId, user.id, site.id);
      }

      context.redirect(`/s/${site.slug}`);
      return;
    }

    const { name, email, p1, p2 } = context.requestBody;

    if (!name.trim() || !email.trim()) {
      context.reactFormResponse.unknownError = true;
      context.reactFormResponse.email = email;
      context.reactFormResponse.name = name;
      await renderFrontend(context, next);
      return;
    }
    const alreadyExists = await context.siteManager.userEmailExists(email);

    if (alreadyExists) {
      context.reactFormResponse.emailError = true;
      context.reactFormResponse.email = email;
      context.reactFormResponse.name = name;
      await renderFrontend(context, next);
      return;
    }

    const createdUser = await context.siteManager.createUser({
      name,
      email,
      role: 'researcher',
    });

    if (invitation) {
      // @todo invitation handling, including possibly setting password.
      await context.siteManager.createInvitationRedemption(invitationId, createdUser.id, site.id);
    }

    const idHash = v4(); // Stored in database and sent to user
    const codeForUser = v4(); // Only sent to user
    const sharedHash = await passwordHash(codeForUser); // Hashed stored in database

    await context.siteManager.resetUserPassword(idHash, sharedHash, createdUser.id, true);

    const route = context.routes.url(
      'activate-account',
      { slug: site.slug },
      { query: `?c1=${codeForUser}&c2=${idHash}` }
    );

    try {
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
      console.log('Unable to send email');
      console.log(e);
      // unknown email error.
      context.reactFormResponse.noEmail = true;
      try {
        const siteAdmins = await context.siteManager.getUsersByRoles(site.id, ['admin'], true);
        for (const admin of siteAdmins) {
          try {
            await context.notifications.addNotification(
              {
                id: generateId(),
                title: `User registered`,
                summary: `${createdUser.name}: We were not able to send an email to this user. You can activate or generate password reset links.`,
                action: {
                  id: 'user:admin',
                  link: `urn:madoc:user:${createdUser.id}`,
                },
                user: admin.id,
              },
              site.id
            );
          } catch (err) {
            console.log('Not able to send notification');
            console.log(err);
          }
        }
      } catch (err) {
        console.log('Unable to list site admins');
      }
    }

    context.reactFormResponse.registerSuccess = true;
  }

  await renderFrontend(context, next);
};
