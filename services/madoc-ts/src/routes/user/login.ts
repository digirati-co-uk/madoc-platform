import fetch from 'node-fetch';
import { RouteMiddleware } from '../../types/route-middleware';

const omekaUrl = process.env.OMEKA__URL as string;

export const loginPage: RouteMiddleware<{ slug: string }, { email: string; password: string }> = async context => {
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
      const foundUser = await context.omeka.getUser(userId);
      if (foundUser) {
        const { user, sites } = foundUser;
        context.state.authenticatedUser = {
          role: user.role,
          name: user.name,
          id: user.id,
          sites,
        };
        context.response.redirect(context.query.redirect || `/s/${context.params.slug}/madoc`);
        return;
      }
    }
  }

  if (context.state.jwt) {
    context.response.redirect(`/s/${context.params.slug}/madoc`);
    return;
  }

  const { email, password } = context.requestBody || {};
  if (context.request.method === 'POST') {
    try {
      const resp = await context.omeka.verifyLogin(email, password);
      if (resp) {
        const { user, sites } = resp;
        // Success.
        context.omekaMessages.push({ type: 'success', message: 'Logged in' });
        // Authenticate
        context.state.authenticatedUser = {
          role: user.role,
          name: user.name,
          id: user.id,
          sites,
        };

        context.response.redirect(context.query.redirect || `/s/${context.params.slug}/madoc`);
        return;
      } else {
        context.omekaMessages.push({ type: 'error', message: 'Your email or password is invalid' });
      }
    } catch (err) {
      console.log(err);
      context.omekaMessages.push({ type: 'error', message: 'Unknown error' });
    }
  }

  context.omekaPage = `
    <div class="c-form c-form--login">
      <h1 class="c-form__heading">Login</h1>
      <form method="post" name="loginform" id="loginform" action="${context.routes.url(
        'post-login',
        {
          slug: context.params.slug,
        },
        { query: { redirect: context.query.redirect } }
      )}">
        <div class="field required">
          <div class="field-meta">
            <label for="email">Email</label>
          </div>
          <div class="inputs">
            <input type="email" name="email" required="required" id="email" value="${email || ''}">    
          </div>
        </div>
        <div class="field required">
          <div class="field-meta">
            <label for="password">Password</label>
          </div>
          <div class="inputs">
            <input type="password" name="password" required="required" id="password" value="">    
          </div>
        </div>
        <input type="submit" name="submit" value="Log in"><input type="hidden" name="redir" value="">
      </form>
      <p class="c-form__forgot-password">
        <a href="/forgot-password">Forgot password?</a>
      </p>
    </div>
  `;
};
