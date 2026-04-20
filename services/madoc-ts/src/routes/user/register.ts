import { v4 } from 'uuid';
import { createUserActivationEmail, createUserActivationText } from '../../emails/user-activation-email';
import { UserInvitation } from '../../extensions/site-manager/types';
import { generateId } from '../../frontend/shared/capture-models/helpers/generate-id';
import { gatewayHost } from '../../gateway/api.server';
import { renderFrontend } from '../../middleware/render-frontend';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { passwordHash } from '../../utility/php-password-hash';
import { validateEmail } from '../../utility/validate-email';
import { accountFrontend } from '../frontend/account-frontend';
import { getAuthPathPrefix, isAccountRequestPath } from './account-route-helper';

const DEFAULT_INVITATION_SITE_ROLE = 'viewer';
const DEFAULT_REGISTRATION_ROLE = 'researcher';
const DEFAULT_TRANSCRIBER_ROLE = 'transcriber';

function mapInvitationForForm(invitation: UserInvitation) {
  return {
    id: invitation.id,
    message: invitation.detail.message,
    role: invitation.detail.role,
    site_role: invitation.detail.site_role,
  };
}

function isInvitationExpired(invitation: UserInvitation | null): boolean {
  if (!invitation) {
    return false;
  }

  const hasUsageLimit = typeof invitation.detail.usesLeft === 'number';
  const hasNoUsesLeft = hasUsageLimit ? invitation.detail.usesLeft <= 0 : false;
  const hasDateExpired = invitation.expires ? new Date().getTime() > invitation.expires.getTime() : false;

  return hasNoUsesLeft || hasDateExpired;
}

export const registerPage: RouteMiddleware = async (context, next) => {
  const accountRequest = isAccountRequestPath(context.path);

  if (context.query.redirect && !context.query.redirect.startsWith('/')) {
    context.query.redirect = '';
  }

  const renderAuthPage = async () => {
    if (accountRequest) {
      await accountFrontend(context, next);
      return;
    }

    await renderFrontend(context, next);
  };

  const userId = context.state.jwt?.user?.id;
  const isLoggedIn = !!(context.state.jwt && userId);

  const invitationId = context.query.code || context.requestBody?.code;
  const site = await context.siteManager.getSiteBySlug(context.params.slug);
  const authPathPrefix = getAuthPathPrefix(site.slug, accountRequest);
  const systemConfig = await context.siteManager.getSystemConfig();
  let invitation: UserInvitation | null = null;
  if (invitationId) {
    try {
      invitation = await context.siteManager.getInvitation(invitationId, site.id);
    } catch (error) {
      if (!(error instanceof NotFound)) {
        throw error;
      }
    }
  }
  const invitationExpired = isInvitationExpired(invitation);
  const hasInvalidInvitationCode = Boolean(invitationId && !invitation);
  const invitationRequired = !site.is_public && !invitation;

  if (!systemConfig.enableRegistrations && !invitation) {
    return context.redirect(`${authPathPrefix}/login`);
  }

  context.reactFormResponse = {
    invitation: invitation && !invitationExpired ? mapInvitationForForm(invitation) : null,
    expired: invitationExpired || hasInvalidInvitationCode,
    invitationRequired: invitationRequired && !invitationId,
  };

  if (context.reactFormResponse.expired || context.reactFormResponse.invitationRequired) {
    await renderAuthPage();
    return;
  }

  // Should we tell the user to go?
  // - isLoggedIn
  // - Does the invite allow for existing users to accept? (default: true)
  // - Does the user already have site permissions?
  if (isLoggedIn) {
    // @todo more in the config to control this. But simplified for now.
    if (!invitation || !invitation.config.allowExistingUsers) {
      return context.redirect(`${authPathPrefix}/login`);
    }

    const user = await context.siteManager.getSiteUserById(userId, site.id);
    if (user.site_role && user.site_role !== 'viewer') {
      return context.redirect(`/s/${site.slug}`);
    }
  }

  if (context.method !== 'POST') {
    await renderAuthPage();
    return;
  }

  const invitationSiteRole = invitation?.detail?.site_role || DEFAULT_INVITATION_SITE_ROLE;

  if (isLoggedIn && userId) {
    const user = await context.siteManager.getSiteUserById(userId, site.id);

    if (invitation && (!user.site_role || user.site_role === 'viewer')) {
      await context.siteManager.setUsersRoleOnSite(site.id, userId, invitationSiteRole);
      await context.siteManager.createInvitationRedemption(invitationId, user.id, site.id);
    }

    context.redirect(`/s/${site.slug}`);
    return;
  }

  const captchaToken = context.requestBody?.['cap-token'];
  const { name, email } = context.requestBody;

  const isValid = captchaToken ? await context.captcha.validateToken(captchaToken) : false;
  if (!isValid || !name.trim() || !email.trim() || !validateEmail(email)) {
    context.reactFormResponse.unknownError = true;
    context.reactFormResponse.email = email;
    context.reactFormResponse.name = name;
    await renderAuthPage();
    return;
  }
  const alreadyExists = await context.siteManager.userEmailExists(email);

  if (alreadyExists) {
    context.reactFormResponse.emailError = true;
    context.reactFormResponse.email = email;
    context.reactFormResponse.name = name;
    await renderAuthPage();
    return;
  }

  const createdUser = await context.siteManager.createUser({
    name,
    email,
    role: invitation?.detail.role || DEFAULT_REGISTRATION_ROLE,
  });

  if (invitation) {
    // @todo invitation handling, including possibly setting password.
    await context.siteManager.createInvitationRedemption(invitationId, createdUser.id, site.id);

    try {
      await context.siteManager.setUsersRoleOnSite(site.id, createdUser.id, invitationSiteRole);
    } catch (e) {
      console.log('Unable to set users role on the site.');
      console.log(e);
    }
  } else if (systemConfig.registeredUserTranscriber) {
    try {
      await context.siteManager.setUsersRoleOnSite(site.id, createdUser.id, DEFAULT_TRANSCRIBER_ROLE);
    } catch (e) {
      console.log('Unable to set users role to transcriber on the site.');
      console.log(e);
    }
  }

  const idHash = v4(); // Stored in database and sent to user
  const codeForUser = v4(); // Only sent to user
  const sharedHash = await passwordHash(codeForUser); // Hashed stored in database

  await context.siteManager.resetUserPassword(idHash, sharedHash, createdUser.id, true);

  const route = context.routes.url(
    !site.is_public || accountRequest ? 'account-activate-account' : 'activate-account',
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
  await renderAuthPage();
};
