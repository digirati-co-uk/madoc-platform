import { test, expect } from '@playwright/test';
import { createTestServer } from './madoc-server.ts';

// const madoc = test.extend({
//   madoc: async ({ page }, use) => {
//     const madoc = createTestServer
//   },
// });

test.describe('Very simple import', () => {
  // test.beforeAll(async ({ page }) => {
  //   const server = await createTestServer();
  //
  //   await page.goto('/');
  //   await expect(page).toHaveTitle(/Madoc/);
  //
  //   console.log(server);
  //
  //   await server.stop();
  // });

  test('has title', async ({ page }) => {
    const server = await createTestServer();

    await page.goto('/');
    await expect(page).toHaveTitle(/Madoc/);

    console.log(server);

    await server.stop();
  });
});
