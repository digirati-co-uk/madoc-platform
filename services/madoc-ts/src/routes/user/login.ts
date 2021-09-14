import fetch from 'node-fetch';
import { omekaSite } from '../../middleware/omeka-site';
import { RouteMiddleware } from '../../types/route-middleware';
import { siteFrontend } from '../admin/frontend';

const omekaUrl = process.env.OMEKA__URL as string;

export const loginPage: RouteMiddleware<{ slug: string }, { email: string; password: string }> = async (
  context,
  next
) => {
  const success = Boolean(context.query.success);

  if (context.query.redirect && !context.query.redirect.startsWith('/')) {
    context.query.redirect = '';
  }

  // Check omeka.
  if (context.req.headers.cookie) {
    const response = await fetch(`${omekaUrl}/s/${context.params.slug}/_template`, {
      method: 'HEAD',
      headers: {
        cookie: context.req.headers.cookie ? context.req.headers.cookie.toString() : '',
        Authorization: context.state.jwt ? `Bearer ${context.state.jwt.token}` : '',
      },
    });
    const userId = Number(response.headers.get('X-Authenticated-User-Id'));
    if (userId && !context.state.jwt) {
      const foundUser = await context.siteManager.getUserAndSites(userId);
      if (foundUser) {
        const { user, sites } = foundUser;
        context.state.authenticatedUser = {
          role: user.role,
          name: user.name,
          id: user.id,
          sites,
        };
        context.response.redirect(context.query.redirect || `/s/${context.params.slug}`);
        return;
      }
    }
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

  await omekaSite(context, async () => {
    await siteFrontend(context, next);
  });
};
