import { pastelColour } from '../../frontend/shared/atoms/Kanban';
import { RouteMiddleware } from '../../types/route-middleware';
import { createHash } from 'crypto';

export const siteUserImage: RouteMiddleware = async context => {
  const { site } = context.state;
  const requestingUserId = context.state.jwt?.user.id;
  const id = context.params.id;

  const fullUser = await context.siteManager.getSiteUserById(id, site.id);
  const fullUserWithEmail = await context.siteManager.getUserById(id);
  const info = await context.siteManager.requestUserDetails(id, requestingUserId, site.id);

  const initial = fullUser.name.trim()[0] || '?';
  const [background, colour] = pastelColour(fullUser.name + fullUser.id);

  const preview = context.query.preview;
  let shouldFetchGravitar = info.allowedDetails.gravitar;
  if (requestingUserId === fullUser.id && (preview === 'gravitar' || preview === 'none')) {
    shouldFetchGravitar = preview === 'gravitar';
  }

  if (shouldFetchGravitar && fullUserWithEmail.email) {
    const hash = createHash('md5')
      .update(fullUserWithEmail.email)
      .digest('hex');
    context.redirect(`https://www.gravatar.com/avatar/${hash}?s=100&d=mp&r=g`);
  } else {
    context.response.body = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect x="0" y="0" width="100" height="100" fill="${background}" />
      <text x="50%" y="50%" dominant-baseline="middle" font-family="sans-serif" font-size="60" fill="${colour}" text-anchor="middle">
        ${initial}
      </text>    
    </svg>
  `;
    context.set('Content-Type', 'image/svg+xml');
  }
};
