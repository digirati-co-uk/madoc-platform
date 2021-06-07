import {RouteMiddleware} from "../../types/route-middleware";
import fetch from "node-fetch";
import {mysql} from "../../utility/mysql";
import {UserInvitation} from "../../types/omeka/UserInvitation";

type Form = {
  email: string;
  name: string;
}

type Params = {
  slug: string;
  code: string;
}

const omekaUrl = process.env.OMEKA__URL as string;

export const registerPage: RouteMiddleware<Params, Form> = async context => {

  const currentSite = await context.omeka.getSiteIdBySlug(context.params.slug);

  // TODO PHP also checks on form if not in query params...
  const invitationCode = context.params.code;
  const invitation = await getInvitation(invitationCode, context);

  if (invitationCode && !invitation) {
    context.omekaMessages.push({ type: 'error', message: 'Invalid or expired invitation code' });
  }

  const currentUser = await getCurrentUser(context);
  if (currentUser) {

    if (!invitation) {
      context.response.redirect(`/s/${context.params.slug}`);
      return;
    }

    let isAlreadyOnSite = false;
    context.mysql.query(mysql`
        SELECT role FROM site_permission WHERE site_id = ${invitation.site_id} AND user_id = ${currentUser.user.id};
      `,
      (err, results: any) => {
        isAlreadyOnSite = !err && !!results;
      }
    );
    if (isAlreadyOnSite) {
      context.omekaMessages.push({ type: 'error', message: 'You are already a member of this site' });
    } else {
      // TODO php uses EntityManager to do this - is anything else going on with that?
      context.mysql.query(mysql`
        INSERT into site_permission (site_id, user_id, role)
        VALUES ${invitation.site_id}, ${currentUser.user.id}, ${invitation.site_role};
      `);
      context.omekaMessages.push({ type: 'success', message: 'You have been added to the new site' });
    }

    const invitedSite = await context.omeka.getSiteById(invitation.site_id);
    // TODO correct URL, or to /madoc?
    context.response.redirect(`/s/${invitedSite.slug}`);
    return;
  }

  // TODO PHP doesn't have the problem of missing current site - should we exit earlier if it's missing?
  if (currentSite?.id) {
    const isRegistrationPermitted = getBooleanSiteSetting('public-user-enable-registration', currentSite.id, context);
    const isInviteOnly = getBooleanSiteSetting('public-user-invite-only', currentSite.id, context);

    if (!isRegistrationPermitted || (isInviteOnly && !invitation)) {
      context.response.redirect(`/s/${context.params.slug}`);
      return;
    }
  }

  const defaultSiteId = await getGlobalSetting('default_site', context);
  if (
    invitation &&
    String(invitation.site_id) !== defaultSiteId &&
    context.request.method === 'POST'
  ) {
    if (String(currentSite?.id) === defaultSiteId && !context.state.jwt) {
      context.omekaMessages.push({ type: 'success', message: 'You\'ve been invited to a different site, you will have access to it once you register here' });
    } else if (String(currentSite?.id) !== defaultSiteId) {
      context.omekaMessages.push({ type: 'error', message: 'Invalid or expired invitation code' });
      context.response.redirect(`/s/${context.params.slug}`);
      return;
    }
  }

  // TODO ideally wouldn't need to check if current site exists here but the API needs it to be checked at some point...
  if (context.request.method === 'POST' && currentSite) {
    return await registerUser(context, currentSite?.id, invitation);
  }

  // TODO what should go into change password fieldset
  // TODO what should go into .c-form__content div
  // TODO how do label translations work?
  // TODO what should be done about CSRF field?
  context.omekaPage = `
    <div class="c-form c-form--register">
      <h1 class="c-form__heading">Register</h1>
      ${invitation && `<p style="font-size: 1.2em; white-space: pre">${invitation.message}</p>`}
      <form method="POST">
        <fieldset id="user-information" class="section active">
          <div class="field required">
            <div class="field-meta">
              <label for="email">Email</label>
            </div>
            <div class="inputs">
              <input type="email" name="user-information[o:email]" id="email" required="required" value="" />
            </div>
          </div>
          <div class="field required">
            <div class="field-meta">
              <label for="name">Display name</label>
            </div>
            <div class="inputs">
              <input type="text" name="user-information[o:name]" id="name" required="required" value="" />
            </div>
          </div>
        </fieldset>
        <fieldset id="change-password" class="section">
        </fieldset>
        <div id="page-actions">
          <button type="submit">Save</button>
        </div>
        <input type="hidden" name="csrf" value="12b6ea2d9b76cd773804af99e9329217-d957d415ecfa4fd3f647aebdd9ec1da8" />
      </form>
      <div class="c-form__content">
      </div>
    </div>
  `;

};

// TODO what is the type of context param?
const getInvitation = async (invitationCode: string, context: any) => {
  const invitation = await new Promise<UserInvitation>((resolve, reject) =>
    context.mysql.query(
      mysql`
        select *
        from user_invitations
        where user_invitations.invitation_id = ${invitationCode}
        limit 1
      `,
      (err: any, results: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(results as UserInvitation);
        }
      }
    )
  );

  if (!invitation) {
    return null;
  }
  if (new Date > invitation.expires) {
    return null;
  }
  // TODO are there legitimate cases in which there isn't a value for uses_left but the invitation is valid?
  if (!invitation.uses_left || invitation.uses_left <= 0) {
    return null;
  }
  return invitation;
};

// TODO what is the type of context param?
const getCurrentUser = async (context: any) => {
  if (context.req.headers.cookie) {
    const response = await fetch(`${omekaUrl}/s/${context.params.slug}/_template`, {
      method: 'HEAD',
      headers: {
        cookie: context.req.headers.cookie ? context.req.headers.cookie.toString() : '',
        Authorization: context.state.jwt ? `Bearer ${context.state.jwt.token}` : '',
      },
    });
    const userId = Number(response.headers.get('X-Authenticated-User-Id'));
    return await context.omeka.getUser(userId);
  }
  return null;
};

// TODO PHP is REEEEAAAALLLLLY confused between user settings and site settings. I'm assuming that these will be in the site_settings table but I might be wrong...
const getBooleanSiteSetting = async (settingKey: string, siteId: number, context: any) => {
  let isToggledOn = false;
  await context.mysql.query(
    mysql`
        select value
        from site_setting
        where id = ${settingKey} and site_id = ${siteId};
      `,
    (err: any, results: any) => {
      if (!err && results === 'true') {
        isToggledOn = true;
      }
    }
  );
  return isToggledOn;
};

const getGlobalSetting = async (settingKey: string, context: any) => {
  return await new Promise<string>((resolve, reject) =>
    context.mysql.query(
      mysql`
        select value
        from setting
        where id = ${settingKey};
      `,
      (err: any, results: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(results as string);
        }
      }
    )
  );
};

const registerUser = async (context: any, siteId: number, invitation: UserInvitation | null) => {

  const form = context.requestBody;

  // TODO PHP retrieves an actual value for this but always returns this string...
  const role = 'Transcriber';
  const isActivationAutomatic = await getBooleanSiteSetting('public-user-automatic-activation', siteId, context);

  if (!isFormValid(form)) {
    context.omekaMessages.push({ type: 'error', message: 'Invalid registration details' });
    return;
  }
  if (await isEmailBlacklisted(form, context)) {
    context.omekaMessages.push({ type: 'error', message: 'Your email address has been blacklisted' });
    return;
  }

  const user = await context.omeka.getUserByEmail(form.email);
  if (user) {
    context.omekaMessages.push({ type: 'error', message: 'There is already an account registered with your email' });
    return;
  }

  if (invitation) {
    if (!invitation.uses_left || invitation.uses_left <= 0) {
      context.omekaMessages.push({ type: 'error', message: 'Invalid or expired invitation code' });
      return;
    }
    await context.mysql.query(mysql`
      UPDATE user_invitation
      SET uses_left = ${invitation.uses_left - 1}
      WHERE invitation_id = ${invitation.invitation_id}
    `);
  }

  await context.mysql.query(mysql`
    INSERT INTO user (email, name, created, role, is_active)
    VALUES (${form.email}, ${form.name}, ${new Date()}, ${role}, ${isActivationAutomatic});
  `);
  const newUser = await context.omeka.getUserByEmail(form.email);

  if (isActivationAutomatic) {
    // TODO set password from change password form if present, or send activation email
  }

  const siteRole = invitation?.role ? invitation.role : 'viewer';
  await context.mysql.query(mysql`
    INSERT INTO site_permission (site_id, user_id, role) 
    VALUES (${siteId}, ${newUser.id}, ${siteRole});
  `);

  context.omekaMessages.push({ type: 'success', message: 'Registration successful' });

  if (isActivationAutomatic) {
    // TODO log user in
  }

  if (invitation) {
    const invitedSite = context.omeka.getSiteById(invitation.site_id);
    context.response.redirect(`/s/${invitedSite.slug}/madoc/register/thank-you`);
    return;
  }

  context.response.redirect(`/s/${context.params.slug}/madoc/register/thank-you`);
};

const isFormValid = (form: Form) => {
  // TODO unclear what the form validation rules are
  return true;
};

const isEmailBlacklisted = async (form: Form, context: any) => {
  const blacklist = await getGlobalSetting('email_blacklist', context);
  const emailDomain = form.email.toLowerCase().split('@').reverse()[0];
  return blacklist.toLowerCase().split('\n').includes(emailDomain);
};
