import { renderFrontend } from '../../middleware/render-frontend';
import { RouteMiddleware } from '../../types/route-middleware';

export const updatePassword: RouteMiddleware<
  { slug: string },
  { password_old: string; p1: string; p2: string }
> = async (context, next) => {
  const userId = context.state.jwt?.user?.id;

  if (!userId) {
    return context.redirect(`/s/${context.params.slug}/madoc`);
  }

  if (context.method === 'POST') {
    const { password_old, p1, p2 } = context.requestBody;

    if (!p1 || !p2 || p1 !== p2) {
      context.reactFormResponse = { passwordError: true };
      return await renderFrontend(context, next);
    }

    const user = await context.siteManager.getUserById(userId);

    if (!user.email) {
      return context.redirect(`/s/${context.params.slug}/madoc`);
    }

    const resp = await context.siteManager.verifyLogin(user.email, password_old);
    if (!resp) {
      await new Promise(resolve => setTimeout(resolve, 500));
      context.reactFormResponse = { invalidPassword: true };
      return await renderFrontend(context, next);
    }

    await context.siteManager.updateUserPassword(user.id, p1);
    context.reactFormResponse = { passwordChangeSuccess: true };
  }

  await renderFrontend(context, next);
};
