import { RouteMiddleware } from '../types';

export const omekaHelloWorld: RouteMiddleware<{ slug: string }> = async context => {
  context.omekaPage = `
    <div class="c-form c-form--login">
      <h1 class="c-form__heading">Login from typescript</h1>
      <form method="POST" name="loginform" id="loginform">
        <div class="field required">
          <div class="field-meta">
            <label for="email">Email</label>
          </div>
          <div class="inputs">
            <input type="email" name="email" required="required" id="email" value="">    
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
