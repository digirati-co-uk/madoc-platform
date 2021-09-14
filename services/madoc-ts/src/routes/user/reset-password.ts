import { siteState } from '../../middleware/site-state';
import { RouteMiddleware } from '../../types/route-middleware';
import validate from 'uuid-validate';
import { siteFrontend } from '../admin/frontend';

export const resetPasswordPage: RouteMiddleware = async (context, next) => {
  if (context.state.jwt) {
    return;
  }

  const c1 = context.query?.c1 || context.requestBody?.c1;
  const c2 = context.query?.c2 || context.requestBody?.c2;

  if (!c1 || !c2 || !validate(c1) || !validate(c2)) {
    context.reactFormResponse = { error: true };

    await siteState(context, async () => {
      await siteFrontend(context, next);
    });
    return;
  }

  try {
    const { userId, created, activate } = await context.siteManager.getPasswordReset(c1, c2);

    const shouldExpire = new Date();
    shouldExpire.setDate(shouldExpire.getDate() - 1);
    if (shouldExpire.getTime() > created.getTime()) {
      context.reactFormResponse = { error: true };

      await siteState(context, async () => {
        await siteFrontend(context, next);
      });
      return;
    }

    context.reactFormResponse = { c1, c2, activate, error: false };

    if (context.method === 'POST') {
      const { p1, p2 } = context.requestBody;

      if (!p1 || !p2 || p1 !== p2) {
        context.reactFormResponse = { formError: true };
      } else {
        // Here is the where we change the password and/or activate.
        await context.siteManager.setUserPassword(c2, p1);

        context.redirect(`/s/${context.params.slug}/login?success=true`);
        return;
      }
    }
  } catch (e) {
    context.reactFormResponse = { error: true };
  }

  await siteState(context, async () => {
    await siteFrontend(context, next);
  });
};
