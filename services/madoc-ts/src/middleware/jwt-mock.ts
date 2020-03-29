import { Middleware } from 'koa';

export const jwtMock: Middleware = async (context, next) => {
  context.state.jwt = {
    context: ['urn:madoc:1'],
    scope: [],
    user: {
      name: 'Test Admin User',
      id: 'http://example.org/users/0',
    },
  };

  await next();
};
