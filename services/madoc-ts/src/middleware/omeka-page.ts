import fetch from 'node-fetch';
import { RouteMiddleware } from '../types/route-middleware';

const omekaUrl = process.env.OMEKA__URL as string;

export const omekaPage: RouteMiddleware<{ slug: string }> = async (context, next) => {
  context.omekaMessages = [];

  await next();

  // Only want to enable this from the context of the madoc site.
  if (typeof context.omekaPage !== 'undefined' && context.params && context.params.slug) {
    // We fetch from Omeka, passing both the cookie and JWT (in-case Omeka is not yet aware of the user.)
    const response = await fetch(`${omekaUrl}/s/${context.params.slug}/_template`, {
      headers: {
        cookie: context.req.headers.cookie ? context.req.headers.cookie.toString() : '',
        Authorization: context.state.jwt ? `Bearer ${context.state.jwt.token}` : '',
      },
    });

    // If Omeka is logged in, but the application is not, then we should return the login page, where this will bee
    // picked up and the JWT for the logged in user will be created.
    const userId = Number(response.headers.get('X-Authenticated-User-Id'));
    if (userId && !context.state.jwt && !context.query.redirect) {
      // Redirects back to the page we are on now.
      context.response.redirect(
        context.routes.url('get-login', { slug: context.params.slug }, { query: { redirect: context.request.url } })
      );
      return;
    }

    // Grab the HTML of the Omeka template.
    const html = await response.text();

    // Split it by the comment indicating the content.
    const [header, footer] = html.split('<!--{{ content }}-->');

    if (typeof context.omekaPage !== 'string') {
      context.omekaPage = await context.omekaPage(context.state.jwt ? context.state.jwt.token : '');
    }

    if (context.omekaPage) {
      // Return the response wrapped in Omeka.
      context.response.body = `
        ${header}
        ${(context.omekaMessages || []).map(
          ({ type, message }) => `<ul class="messages messages--body"><li class="${type}">${message}</li></ul>`
        )}
        ${context.omekaPage}
        ${footer}
      `;
    }
  }
};
