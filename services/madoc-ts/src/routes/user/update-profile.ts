import { renderFrontend } from '../../middleware/render-frontend';
import { RouteMiddleware } from '../../types/route-middleware';

export const updateProfilePage: RouteMiddleware = async (context, next) => {
  const userId = context.state.jwt?.user?.id;

  if (!userId) {
    return context.redirect(`/s/${context.params.slug}`);
  }

  if (context.method === 'POST') {
    const { name } = context.requestBody;
    if (name) {
      await context.siteManager.updateUser(userId, {
        name,
      });
      context.reactFormResponse = { success: true };
    }
  }

  await renderFrontend(context, next);
};
