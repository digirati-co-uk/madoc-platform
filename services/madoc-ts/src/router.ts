import { TypedRouter } from './utility/typed-router';
import { ping } from './routes/ping';
import { omekaHelloWorld } from './routes/omeka-hello-world';
import { madocNotFound } from './routes/madoc-not-found';
import { keys } from './routes/keys';

export const router = new TypedRouter({
  // Normal route
  'get-ping': [TypedRouter.GET, '/api/madoc', ping],
  'omeka-test': [TypedRouter.GET, '/s/:slug/madoc/hello-world', omekaHelloWorld],
  'get-keys': [TypedRouter.GET, '/s/:slug/madoc/test-key', keys],
  'omeka-404': [TypedRouter.GET, '/s/:slug/madoc*', madocNotFound],
});
