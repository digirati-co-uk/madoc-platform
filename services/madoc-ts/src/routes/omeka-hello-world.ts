import { RouteMiddleware } from '../types';

export const omekaHelloWorld: RouteMiddleware<{ slug: string }> = async context => {
  context.omekaPage = `
    <h1>Hello from Madoc</h1>
  `;
};
