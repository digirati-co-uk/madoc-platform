import { RouteMiddleware } from '../../types/route-middleware';
import { RequestError } from '../../utility/errors/request-error';

export const captchaChallenge: RouteMiddleware = async context => {
  context.response.body = await context.captcha.createChallenge();
  context.response.status = 200;
};

export const captchaRedeem: RouteMiddleware<{}, { token: string; solutions: number[] }> = async context => {
  const { token, solutions } = context.request.body;
  if (!token || !solutions) {
    throw new RequestError();
  }

  context.response.body = await context.captcha.redeemChallenge({ token, solutions });
  context.response.status = 200;
};
