import { Middleware } from 'koa';

export const jwtMock: Middleware = async (context, next) => {
  context.state.jwt = {
    scope: ['tasks.admin'],
    user: {
      name: 'Test Admin User',
      id: 'http://example.org/users/0',
    },
  };

  await next();
};
