import {RouteMiddleware} from "../../types/route-middleware";

export const thanksPage: RouteMiddleware<{ slug: string }, { email: string; password: string }> = async context => {
  // TODO is this the correct URL?
  context.omekaPage = `
    <div class="c-form c-form--thank-you">
      <h2>Thank you for registering</h2>
      <a href="/s/${context.params.slug}">Proceed to site</a>
    </div>
  `;
};