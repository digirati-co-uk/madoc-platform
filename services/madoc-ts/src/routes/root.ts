import * as EmailValidator from 'email-validator';
import { phpHashCompare } from '../utility/php-hash-compare';
import { RouteMiddleware } from './../types/route-middleware';

function installPage(body: string) {
  return `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Madoc</title>
  </head>
  <body>
    ${body}    
  </body>
  </html>`;
}

export const siteRoot: RouteMiddleware = async context => {
  const system = await context.siteManager.getSystemConfig();

  if (system.defaultSite) {
    context.redirect(`/s/${system.defaultSite}`);
    return;
  }

  const allSites = await context.siteManager.listAllSites();

  if (allSites.length === 0) {
    // Initial page = enter the code.
    if (context.request.method !== 'POST') {
      context.response.body = installPage(`
      <div>
        <form method="post">
          <h1>Madoc</h1>
          <p>Your Madoc is almost ready. To proceed, enter your installation code</p>
          <input type="text" name="ic" />
          <button type="submit">Continue</button>
        </form>
      </div>
    `);
      context.response.status = 200;
      return;
    }

    // Step 2: validate the IC code.
    const hash = process.env.MADOC_INSTALLATION_CODE;
    const code = context.requestBody.ic;
    // Lovely wrapper to avoid deriving if the code is set or note using timing.
    const isValid = await new Promise(resolve => {
      const timer = new Promise(r => setTimeout(r, 2000));
      const result: Promise<boolean> = hash ? phpHashCompare(code, hash) : Promise.resolve(false);
      Promise.all([result, timer]).then(([isValidPromise]) => resolve(isValidPromise));
    });

    if (!hash || !isValid) {
      context.response.body = installPage(`
        <p>Invalid code</p>
      `);
      return;
    }

    const body: {
      install_title: string;
      admin_email: string;
      admin_name: string;
      admin_password: string;
      admin_password_2: string;
      site_name: string;
      site_slug: string;
    } = context.requestBody;

    const errors = {
      hasErrors: false,
      invalidInstallTitle: false,
      invalidEmail: false,
      invalidPassword: false,
      invalidSiteName: false,
      invalidSiteSlug: false,
      invalidName: false,
    };

    if (context.requestBody.install) {
      if (!body.install_title) {
        errors.invalidInstallTitle = true;
      }

      if (!body.admin_email || !EmailValidator.validate(body.admin_email)) {
        errors.invalidEmail = true;
      }

      if (!body.admin_password || !body.admin_password_2 || body.admin_password !== body.admin_password_2) {
        errors.invalidPassword = true;
      }

      if (!body.site_name) {
        errors.invalidSiteName = true;
      }

      if (!body.site_slug || body.site_slug.match(/^[A-Za-z0-9]+$/g) === null) {
        errors.invalidSiteSlug = true;
      }

      // At the end.
      errors.hasErrors =
        errors.invalidInstallTitle ||
        errors.invalidEmail ||
        errors.invalidPassword ||
        errors.invalidSiteName ||
        errors.invalidSiteSlug;
    }

    if (context.requestBody.install && !errors.hasErrors) {
      // - Create site
      // - Create user
      // - Change global settings
      // Redirect to site login page / display button to take you to the site.
      context.response.body = installPage('Success.');

      // Create user
      const createdUser = await context.siteManager.createUser({
        email: body.admin_email,
        name: body.admin_name || 'Admin',
        role: 'global_admin',
      });

      // Create password
      await context.siteManager.updateUserPassword(createdUser.id, body.admin_password);

      // Activate user
      await context.siteManager.activateUser(createdUser.id);

      // Create site.
      const site = await context.siteManager.createSite(
        {
          title: body.site_name,
          slug: body.site_slug,
          is_public: true, // for now.
          config: {
            emailActivation: true,
            enableRegistrations: false,
            enableNotifications: true,
            autoPublishImport: system.autoPublishImport,
          },
        },
        createdUser.id,
        context.externalConfig.permissions
      );

      await context.siteManager.setUsersRoleOnSite(site.id, createdUser.id, 'admin');

      await context.siteManager.setSystemConfigValue('installationTitle', body.install_title);
      await context.siteManager.setSystemConfigValue('defaultSite', site.slug);

      context.redirect(`/s/${site.slug}/login`);

      return;
    }

    context.response.body = installPage(`
      <div>
      <style>
        label{display:block}
        .input{}
        .input--error {color: red}
      </style>
        <form method="post">
          <h1>Madoc</h1>
          <p>Set up a few details</p>
          
          ${errors.hasErrors ? `<p>There are some errors, please see highlighted below</p>` : ''}
          
          <h3>About your installation</h3>
          
          <div class="input ${errors.invalidSiteName ? 'input--error' : ''}">
            <label for="install_title">Installation title</label>
            <input type="text" id="install_title" name="install_title" value="${body.install_title || ''}" />
          </div>
           
          <h3>Admin user</h3>
          
          <div class="input ${errors.invalidName ? 'input--error' : ''}">
            <label for="admin_name">Admin name</label>
            <input type="text" id="admin_name" name="admin_name" value="${body.admin_name || 'Admin'}" />
          </div>
          
          <div class="input ${errors.invalidEmail ? 'input--error' : ''}">
            <label for="admin_email">Admin email</label>
            <input type="text" id="admin_email" name="admin_email" value="${body.admin_email || ''}" />
          </div>
          
          <div class="input ${errors.invalidPassword ? 'input--error' : ''}">
            <label for="admin_password">Admin password</label>
            <input type="password" id="admin_password" name="admin_password" />
          </div>
          
          <div class="input ${errors.invalidPassword ? 'input--error' : ''}">
            <label for="admin_password_2">Admin password - confirm</label>
            <input type="password" id="admin_password_2" name="admin_password_2" />
          </div>
          
          <h3>Your first site</h3>
          <p>This will be set as the default site when you visit your domain. This can be changed later.</p>
          
          <div class="input ${errors.invalidSiteName ? 'input--error' : ''}">
            <label for="site_name">Name of site</label>
            <input type="text" id="site_name" name="site_name" value="${body.site_name || 'My site'}" />
          </div>
          
          <div class="input ${errors.invalidSiteSlug ? 'input--error' : ''}">
            <label for="site_slug">URL of site (slug)</label>
            /s/<input type="text" id="site_slug" name="site_slug" value="${body.site_slug || 'default'}" />/...
          </div>
         
         <hr />
         
         
          <input type="hidden" name="ic" value="${code}" />
          <input type="hidden" name="install" value="1" />
          <button type="submit">Continue</button>
        </form>
      </div>
    `);
    return;
  }

  // @todo list of sites or similar? Possibly onboarding process.
  context.response.body = `<!doctype html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Madoc</title>
    </head>
    <body>
      <div>
        <h1>Madoc</h1>
      </div>    
    </body>
    </html>
  `;
  context.response.status = 200;
};
