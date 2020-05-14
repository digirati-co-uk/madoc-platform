import { RouteMiddleware } from '../types/route-middleware';

export const omekaHelloWorld: RouteMiddleware<{ slug: string }> = async context => {
  context.omekaPage = `
    <h1>Hello from Madoc</h1>
  `;
};
